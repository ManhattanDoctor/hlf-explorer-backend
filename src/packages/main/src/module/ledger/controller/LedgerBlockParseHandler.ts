import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { Transport, TransportCommandHandler, TransportWaitError } from '@ts-core/common/transport';
import { ILedgerBlockParseDto, LedgerBlockParseCommand } from '../../../core/transport/command/LedgerBlockParseCommand';
import { LedgerBlockEntity } from '../../../core/database/entity/LeggerBlockEntity';
import { DatabaseService } from '../../../core/database/DatabaseService';
import { LedgerBlockParsedEvent } from '../../../core/transport/event/LedgerBlockParsedEvent';
import { LedgerApiFactory } from '../service/LedgerApiFactory';
import { TransportFabricBlockParser } from '@ts-core/blockchain-fabric/transport/block';
import { LedgerBlockTransaction, LedgerBlock } from '@hlf-explorer/common/ledger';
import { LedgerBlockTransactionEntity } from '../../../core/database/entity/LedgerBlockTransactionEntity';
import { ObjectUtil, TransformUtil, ValidateUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { request } from 'http';
import { ExtendedError } from '@ts-core/common/error';

@Injectable()
export class LedgerBlockParseHandler extends TransportCommandHandler<ILedgerBlockParseDto, LedgerBlockParseCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private api: LedgerApiFactory) {
        super(logger, transport, LedgerBlockParseCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILedgerBlockParseDto): Promise<void> {
        this.log(`Parsing block #${params.number} for ${params.ledgerId} ledger...`);
        let api = await this.api.get(params.ledgerId);
        let parser = new TransportFabricBlockParser();

        let rawBlock = await api.getBlock(params.number);
        let parsedBlock = parser.parse(rawBlock);

        let block = new LedgerBlockEntity();
        block.rawData = rawBlock;
        block.ledgerId = params.ledgerId;
        ObjectUtil.copyProperties(parsedBlock, block, ['hash', 'number', 'createdDate']);

        block.transactions = parsedBlock.transactions.map(transaction => {
            let item = new LedgerBlockTransactionEntity();
            item.ledgerId = params.ledgerId;
            
            item.block = block;
            item.blockNumber = block.number;
            ObjectUtil.copyProperties(transaction, item);

            let request = item.request;
            if (!_.isNil(request)) {
                item.requestId = request.id;
                item.requestName = request.name;
                if (!_.isNil(request.options)) {
                    item.requestUserId = request.options.userId;
                }
            }

            let response = item.response;
            if (!_.isNil(response)) {
                if (!_.isNil(response.response)) {
                    item.responseErrorCode = ExtendedError.instanceOf(response.response) ? response.response.code : null;
                }
            }
            return item;
        });

        await this.database.ledgerBlockSave(block);
        await this.database.ledgerUpdate({ id: params.ledgerId, blockHeightParsed: block.number });

        // Have to use TransformUtil here
        this.transport.dispatch(new LedgerBlockParsedEvent({ ledgerId: params.ledgerId, block: TransformUtil.fromClass(block) }));
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected handleError(command: LedgerBlockParseCommand, error: Error): void {
        // this.error(`Error to parse block ${command.request.number}`);
        // this.error(error);
        // super.handleError(command, new TransportWaitError(error.message));
        super.handleError(command, error);
    }
}
