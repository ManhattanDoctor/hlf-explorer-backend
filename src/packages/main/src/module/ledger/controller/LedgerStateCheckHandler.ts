import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TraceUtil } from '@ts-core/common/trace';
import { Transport, TransportCommandHandler } from '@ts-core/common/transport';
import { LedgerStateCheckCommand, ILedgerStateCheckDto } from '../../../core/transport/command/LedgerStateCheckCommand';
import { DatabaseService } from '../../../core/database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import * as _ from 'lodash';
import { Ledger } from '@hlf-explorer/common/ledger';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { LedgerBlockParseCommand } from '../../../core/transport/command/LedgerBlockParseCommand';
import { LedgerApiFactory } from '../service/LedgerApiFactory';

@Injectable()
export class LedgerStateCheckHandler extends TransportCommandHandler<ILedgerStateCheckDto, LedgerStateCheckCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private api: LedgerApiFactory) {
        super(logger, transport, LedgerStateCheckCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILedgerStateCheckDto): Promise<void> {
        let ledger = await this.database.ledger.findOne({ id: params.ledgerId });
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
        for (let block of await this.getUnparsedBlocks(ledger, blocks)) {
            this.parseBlock(params.ledgerId, block);
        }
    }

    protected async getUnparsedBlocks(ledger: Ledger, blocksToCheck: Array<number>): Promise<Array<number>> {
        let items = await Promise.all(
            _.chunk(blocksToCheck, TypeormUtil.POSTGRE_FORIN_MAX).map(chunk =>
                this.database.ledgerBlock
                    .createQueryBuilder('block')
                    .select(['block.number'])
                    .where('block.ledgerId = :ledgerId', { ledgerId: ledger.id })
                    .andWhere('block.number IN (:...blockNumbers)', { blockNumbers: chunk })
                    .getMany()
            )
        );
        let blocks: Array<number> = _.flatten(items).map(item => item.number);
        return blocksToCheck.filter(blockHeight => !blocks.includes(blockHeight));
    }

    protected async getCurrentBlockHeight(ledger: Ledger): Promise<number> {
        return ledger.blockHeight;
    }

    protected async getLastBlockHeight(ledger: Ledger): Promise<number> {
        let api = await this.api.get(ledger.id);
        return (await api.getBlockNumber()) - 1;
    }

    protected parseBlock(ledgerId: number, number: number): void {
        this.transport.send(new LedgerBlockParseCommand(TraceUtil.addIfNeed({ ledgerId, number })));
    }
}
