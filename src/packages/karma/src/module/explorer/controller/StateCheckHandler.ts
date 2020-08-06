import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TraceUtil } from '@ts-core/common/trace';
import { Transport, TransportCommandHandler } from '@ts-core/common/transport';
import { StateCheckCommand } from '../transport/command/StateCheckCommand';
import { DatabaseService } from '../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import * as _ from 'lodash';
import { Ledger } from '@hlf-explorer/common/ledger';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { ExplorerService } from '../service/ExplorerService';
import { BlockParseCommand } from '../transport/command/BlockParseCommand';

@Injectable()
export class StateCheckHandler extends TransportCommandHandler<void, StateCheckCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private service: ExplorerService, private api: LedgerApi) {
        super(logger, transport, StateCheckCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let ledger = await this.service.ledgerGet();
        let blockLast = await this.getLastBlockHeight(ledger);

        if (_.isNaN(blockLast) || blockLast === 0) {
            throw new ExtendedError(`Last block is incorrect`);
        }

        let blockHeight = await this.getCurrentBlockHeight(ledger);
        if (blockHeight >= blockLast) {
            return;
        }

        this.log(`Check blocks: ${blockLast - blockHeight} = ${blockLast} - ${blockHeight}`);
        await this.database.ledgerUpdate({ id: ledger.id, blockHeight: blockLast });

        let blocks: Array<number> = [];
        for (let i = blockHeight + 1; i <= blockLast; i++) {
            blocks.push(i);
        }
        for (let block of await this.getUnparsedBlocks(blocks)) {
            this.parseBlock(block);
        }
    }

    protected async getUnparsedBlocks(blocksToCheck: Array<number>): Promise<Array<number>> {
        let items = await Promise.all(
            _.chunk(blocksToCheck, TypeormUtil.POSTGRE_FORIN_MAX).map(chunk =>
                this.database.ledgerBlock
                    .createQueryBuilder('block')
                    .select(['block.number'])
                    .where('block.number IN (:...blockNumbers)', { blockNumbers: chunk })
                    .getMany()
            )
        );
        let blocks: Array<number> = _.flatten(items).map(item => item.number);
        return blocksToCheck.filter(blockHeight => !blocks.includes(blockHeight));
    }

    protected async getCurrentBlockHeight(ledger: Ledger): Promise<number> {
        let item = await this.service.ledgerGet();
        return item.blockHeight;
    }

    protected async getLastBlockHeight(ledger: Ledger): Promise<number> {
        let item = await this.api.getInfo(ledger.name);
        return item.blockLast.number;
    }

    protected parseBlock(number: number): void {
        this.transport.send(new BlockParseCommand(number));
    }
}
