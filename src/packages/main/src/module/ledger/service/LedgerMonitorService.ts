import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { MapCollection } from '@ts-core/common/map';
import * as _ from 'lodash';
import { Namespace, Socket } from 'socket.io';
import { LedgerInfo, LedgerBlock, Ledger, LedgerBlocksLast } from '@hlf-explorer/common/ledger';
import { LEDGER_SOCKET_NAMESPACE, LedgerSocketEvent } from '@hlf-explorer/common/api/ledger';
import { DatabaseService } from '../../database/DatabaseService';
import { Transport } from '@ts-core/common/transport';
import { LedgerBlockParsedEvent, ILedgerBlockParsedDto } from '../transport/event/LedgerBlockParsedEvent';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';

@WebSocketGateway({ namespace: LEDGER_SOCKET_NAMESPACE })
export class LedgerMonitorService extends LoggerWrapper implements OnGatewayInit<Namespace>, OnGatewayConnection, OnGatewayDisconnect {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private items: MapCollection<LedgerInfo>;
    private namespace: Namespace;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private transport: Transport) {
        super(logger);

        this.items = new MapCollection('id');
        this.transport.getDispatcher<LedgerBlockParsedEvent>(LedgerBlockParsedEvent.NAME).subscribe(item => this.blockParsed(item.data));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createLedgerInfo(ledger: Ledger): Promise<LedgerInfo> {
        let item = new LedgerInfo();
        item.id = ledger.id;
        item.name = ledger.name;
        item.blocksLast = new LedgerBlocksLast(await this.getBlocks(ledger.id));
        item.blockLast = item.blocksLast.getFirst();
        return item;
    }

    private async getBlocks(ledgerId: number): Promise<Array<LedgerBlock>> {
        let blocks = await TypeormUtil.toPagination(
            this.database.ledgerBlock
                .createQueryBuilder('item')
                .innerJoinAndSelect('item.transactions', 'transactions')
                .innerJoinAndSelect('item.events', 'events'),
            {
                pageIndex: 0,
                pageSize: LedgerBlocksLast.MAX_LENGTH,
                sort: { number: false, ledgerId: true },
                conditions: { ledgerId }
            },
            async value => {
                let item = TransformUtil.fromClass(value);
                item.rawData = null;
                return item;
            }
        );
        return blocks.items;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(ledgers: Array<Ledger>): Promise<void> {
        for (let ledger of ledgers) {
            if (!this.items.has(ledger.id.toString())) {
                this.items.add(await this.createLedgerInfo(ledger));
            }
        }
    }

    public blockParsed(event: ILedgerBlockParsedDto): void {
        let item = this.getInfo(event.ledgerId);
        if (_.isNil(item)) {
            return;
        }

        let data: Partial<LedgerInfo> = { id: item.id, name: item.name, blockLast: event.block };
        this.namespace.emit(LedgerSocketEvent.LEDGER_BLOCK_PARSED, data);

        let block = TransformUtil.toClass(LedgerBlock, event.block);
        if (!_.isNil(item.blockLast) && item.blockLast.number >= block.number) {
            return;
        }
        item.blockLast = block;
        item.blocksLast.add(block);
        this.namespace.emit(LedgerSocketEvent.LEDGER_UPDATED, data);
    }

    public getInfo(ledgerId: number): LedgerInfo {
        return this.items.get(ledgerId.toString());
    }

    public getInfoByName(name: string): LedgerInfo {
        for (let item of this.items.collection) {
            if (item.name === name) {
                return item;
            }
        }
        return null;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    public afterInit(item: Namespace): any {
        this.log(`Socket initialized on namespace ${item.name}`);
        this.namespace = item;
    }

    public async handleConnection(client: Socket): Promise<any> {
        try {
            client.emit(LedgerSocketEvent.LEDGERS, TransformUtil.fromClassMany(this.items.collection));
        } catch (error) {
            client.emit(LedgerSocketEvent.EXCEPTION, ExtendedError.create(error));
            client.disconnect(true);
        }
    }

    public handleDisconnect(client: Socket): any {}
}
