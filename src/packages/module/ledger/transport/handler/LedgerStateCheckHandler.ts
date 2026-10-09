import { Injectable } from '@nestjs/common';
import { ExtendedError, TraceUtil, Transport, TransportCommandHandler, Logger } from '@ts-core/common';
import { LedgerStateCheckCommand, ILedgerStateCheckDto } from '../LedgerStateCheckCommand';
import { DatabaseService } from '@project/module/database/service';
import { Ledger } from '@hlf-explorer/common';
import { TypeormUtil } from '@ts-core/backend';
import { LedgerBlockParseCommand } from '../LedgerBlockParseCommand';
import { LedgerTransportFactory } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class LedgerStateCheckHandler extends TransportCommandHandler<ILedgerStateCheckDto, LedgerStateCheckCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private factory: LedgerTransportFactory) {
        super(logger, transport, LedgerStateCheckCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILedgerStateCheckDto): Promise<void> {
        let blockLast = await this.getLastBlockHeight(params.ledgerId);
        if (_.isNaN(blockLast) || blockLast === 0) {
            throw new ExtendedError(`Last block is incorrect`);
        }

        let ledger = await this.database.ledger.findOneBy({ id: params.ledgerId });
        let blockHeight = ledger.blockHeight;
        if (blockHeight >= blockLast) {
            return;
        }

        await this.database.ledgerUpdate({ id: ledger.id, blockHeight: blockLast });

        for (let number of await this.getUnparsedBlocks(ledger, blockHeight + 1, blockLast)) {
            this.parseBlock(params.ledgerId, number);
        }
    }

    protected async getUnparsedBlocks(ledger: Ledger, start: number, end: number): Promise<Array<number>> {
        let blocksToCheck = _.range(start, end + 1);
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

    protected async getLastBlockHeight(ledgerId: number): Promise<number> {
        let api = await this.factory.get(ledgerId);
        let blockNumber = await api.api.qsccContract.getBlockNumber();
        return blockNumber - 1;
    }

    protected parseBlock(ledgerId: number, number: number): void {
        this.transport.send(new LedgerBlockParseCommand(TraceUtil.addIfNeed({ ledgerId, number })));
    }
}
