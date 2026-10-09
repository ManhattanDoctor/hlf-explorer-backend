import { Injectable } from '@nestjs/common';
import { ExtendedError, ObjectUtil, TransformUtil, Logger, Transport, TransportCommandHandler } from '@ts-core/common';
import { ILedgerBlockParseDto, LedgerBlockParseCommand } from '../LedgerBlockParseCommand';
import { LedgerBlockEntity, LedgerBlockEventEntity } from '@project/module/database/block';
import { DatabaseService } from '@project/module/database/service';
import { LedgerBlockParsedEvent } from '../LedgerBlockParsedEvent';
import { TransportFabricBlockParser, ITransportFabricTransaction, ITransportFabricEvent } from '@hlf-core/transport';
import { LedgerBlockRawEntity, LedgerBlockTransactionEntity } from '@project/module/database/block';
import { TRANSPORT_FABRIC_COMMAND_BATCH_NAME } from '@hlf-core/transport-common';
import { LedgerTransportFactory } from '../../service';
import { TransportFabricBlockParserBatch } from '@hlf-core/transport';
import { LedgerFabricBatch } from '@project/module/ledger/service';
import * as _ from 'lodash';

@Injectable()
export class LedgerBlockParseHandler extends TransportCommandHandler<ILedgerBlockParseDto, LedgerBlockParseCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private factory: LedgerTransportFactory) {
        super(logger, transport, LedgerBlockParseCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    private parseObject(item: any): void {
        if (!_.isObject(item)) {
            return;
        }
        for (let key in item) {
            let value = item[key];
            if (value instanceof Buffer) {
                item[key] = value.toString();
            }
            else if (_.isObject(value)) {
                this.parseObject(value);
            }
        }
    }

    protected async execute(params: ILedgerBlockParseDto): Promise<void> {
        this.log(`Parsing block #${params.number} (${params.ledgerId}) ledger...`);

        let api = await this.factory.get(params.ledgerId);
        let rawBlock = await api.api.qsccContract.getBlock(params.number);

        let parser = api instanceof LedgerFabricBatch ? new TransportFabricBlockParserBatch(api.api) : new TransportFabricBlockParser();
        let parsedBlock = await parser.parse(rawBlock);

        let block = new LedgerBlockEntity();
        block.ledgerId = params.ledgerId;
        ObjectUtil.copyProperties(parsedBlock, block, ['hash', 'number', 'date']);

        this.parseObject(rawBlock);

        let raw = block.data = new LedgerBlockRawEntity();
        raw.data = rawBlock;
        block.events = parsedBlock.events.map(event => this.parseEvent(block, event));
        block.eventsCount = block.events.length;
        block.transactions = parsedBlock.transactions.map(transaction => this.parseTransaction(block, transaction));
        block.transactionsCount = block.transactions.length;
        await this.database.ledgerBlock.save(block);
        await this.database.ledgerUpdate({ id: params.ledgerId, blockHeightParsed: block.number });

        this.log(`Block #${params.number} (${params.ledgerId}) ledger parsed`);
        // Have to use TransformUtil here
        this.transport.dispatch(new LedgerBlockParsedEvent({ ledgerId: params.ledgerId, block: TransformUtil.fromClass(block) }));
    }

    private parseEvent = (block: LedgerBlockEntity, event: ITransportFabricEvent): LedgerBlockEventEntity => {
        let item = new LedgerBlockEventEntity();
        item.ledgerId = block.ledgerId;
        item.blockNumber = block.number;

        if (ObjectUtil.hasOwnProperties(event.data, ['name', 'data']) && event.name === event.data.name) {
            ObjectUtil.copyProperties({ data: event.data }, event);
        }
        ObjectUtil.copyProperties(event, item);
        return item;
    };

    private parseTransaction = (block: LedgerBlockEntity, transaction: ITransportFabricTransaction): LedgerBlockTransactionEntity => {
        let item = new LedgerBlockTransactionEntity();
        item.ledgerId = block.ledgerId;
        item.blockNumber = block.number;
        ObjectUtil.copyProperties(transaction, item);

        if (_.isNil(item.blockReceived)) {
            item.blockReceived = block.number;
        }

        let request = item.request;
        if (!_.isNil(request)) {
            item.requestId = request.id;
            item.requestName = request.name;
            if (item.requestName === TRANSPORT_FABRIC_COMMAND_BATCH_NAME) {
                item.isBatch = true;
            }
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
