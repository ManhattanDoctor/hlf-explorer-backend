import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { Transport, TransportCommandHandler } from '@ts-core/common/transport';
import { ILedgerBlockParseDto, LedgerBlockParseCommand } from '../transport/command/LedgerBlockParseCommand';
import { LedgerBlockEntity } from '../../database/entity/LeggerBlockEntity';
import { DatabaseService } from '../../database/DatabaseService';
import { LedgerBlockParsedEvent } from '../transport/event/LedgerBlockParsedEvent';
import { LedgerApiFactory } from '../service/LedgerApiFactory';
import { TransportFabricBlockParser, ITransportFabricTransaction, ITransportFabricEvent } from '@ts-core/blockchain-fabric/transport/block';
import { LedgerBlockTransactionEntity } from '../../database/entity/LedgerBlockTransactionEntity';
import { ObjectUtil, TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerBlockEventEntity } from '../../database/entity/LedgerBlockEventEntity';

@Injectable()
export class LedgerBlockParseHandler extends TransportCommandHandler<ILedgerBlockParseDto, LedgerBlockParseCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private factory: LedgerApiFactory) {
        super(logger, transport, LedgerBlockParseCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILedgerBlockParseDto): Promise<void> {
        this.log(`Parsing block #${params.number} for ${params.ledgerId} ledger...`);
        let api = await this.factory.get(params.ledgerId);
        let parser = new TransportFabricBlockParser();

        let rawBlock = await api.getBlock(params.number);
        let parsedBlock = parser.parse(rawBlock);

        let item = new LedgerBlockEntity();
        item.ledgerId = params.ledgerId;

        item.uid = uuid();
        item.rawData = rawBlock;
        ObjectUtil.copyProperties(parsedBlock, item, ['hash', 'number', 'createdDate']);

        item.events = parsedBlock.events.map(event => this.parseEvent(params.ledgerId, item, event));
        item.transactions = parsedBlock.transactions.map(transaction => this.parseTransaction(params.ledgerId, item, transaction));

        await this.database.ledgerBlockSave(item);
        await this.database.ledgerUpdate({ id: params.ledgerId, blockHeightParsed: item.number });

        // Have to use TransformUtil here
        this.transport.dispatch(new LedgerBlockParsedEvent({ ledgerId: params.ledgerId, block: TransformUtil.fromClass(item) }));
    }

    private parseEvent = (ledgerId: number, block: LedgerBlockEntity, event: ITransportFabricEvent) => {
        let item = new LedgerBlockEventEntity();
        item.ledgerId = ledgerId;

        item.uid = uuid();
        item.block = block;
        item.blockNumber = block.number;

        if (ObjectUtil.hasOwnProperties(event.data, ['name', 'data']) && event.name === event.data.name) {
            ObjectUtil.copyProperties({ data: event.data }, event);
        }
        ObjectUtil.copyProperties(event, item);

        return item;
    };

    private parseTransaction = (ledgerId: number, block: LedgerBlockEntity, transaction: ITransportFabricTransaction) => {
        let item = new LedgerBlockTransactionEntity();
        item.ledgerId = ledgerId;

        item.uid = uuid();
        item.block = block;
        item.blockNumber = block.number;
        ObjectUtil.copyProperties(transaction, item);

        let request = item.request;
        if (!_.isNil(request)) {
            item.requestId = request.id;
            item.requestName = request.name;
            if (!_.isNil(request.options) && ObjectUtil.hasOwnProperty(request.options, 'userId')) {
                item.requestUserId = request.options['userId'];
            }
        }
        
        let response = item.response;
        if (!_.isNil(response) && !_.isNil(response.response)) {
            item.responseErrorCode = ExtendedError.instanceOf(response.response) ? response.response.code : null;
        }
        return item;
    };
}
