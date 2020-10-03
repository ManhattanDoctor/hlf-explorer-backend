import { LoggerWrapper, Logger } from '@ts-core/common/logger';
import { Transport } from '@ts-core/common/transport';
import { Ledger } from '@hlf-explorer/common/ledger';
import { TraceUtil } from '@ts-core/common/trace';
import { DatabaseService } from '../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerTransportFactory } from './LedgerTransportFactory';
import * as _ from 'lodash';
import { LedgerBlockParseCommand } from '../transport/command/LedgerBlockParseCommand';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { Block } from 'fabric-client';
import { BlockEventListener } from 'fabric-network';

export class LedgerBlockMonitor extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private listener: BlockEventListener;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private factory: LedgerTransportFactory) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Handlers
    //
    // --------------------------------------------------------------------------

    public async start(ledgerId: number): Promise<void> {
        if (!_.isNil(this.listener)) {
            return;
        }
        let ledger = await this.database.ledger.findOne({ id: ledgerId });
        await this.check(ledger);

        let transport = await this.factory.get(ledgerId);
        let blockLast = await this.getLastBlockHeight(ledger);

        this.log(`Listening "${ledger.name}" from ${blockLast} block...`);
        this.listener = await transport.api.network.addBlockListener(
            ledgerId.toString(),
            (error: Error, block: Block) => {
                if (!_.isNil(error)) {
                    this.error(`Received error in "${ledger.name}" blocks: ${error.message}`);
                    return;
                }
                console.log(block);
            },
            { startBlock: blockLast, }
        );
    }

    public stop(): void {
        if (!_.isNil(this.listener)) {
            this.listener.unregister();
            return;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Help Methods
    //
    // --------------------------------------------------------------------------

    private async check(ledger: Ledger): Promise<void> {
        this.log(`Checking ${ledger.name} status...`);
        let blockLast = await this.getLastBlockHeight(ledger) - 1;
        let blockCurrent = ledger.blockHeight;

        if (_.isNaN(blockLast) || blockLast === 0) {
            throw new ExtendedError(`Last block in "${ledger.name}" is incorrect`);
        }

        if (blockCurrent >= blockLast) {
            this.log(`"${ledger.name}" synchronized`);
            return;
        }

        this.log(`Load blocks "${ledger.name}": ${blockLast - blockCurrent} = ${blockLast} - ${blockCurrent}`);
        await this.database.ledgerUpdate({ id: ledger.id, blockHeight: blockLast });

        for (let number of await this.getUnparsedBlocks(ledger, blockCurrent + 1, blockLast)) {
            this.transport.send(new LedgerBlockParseCommand(TraceUtil.addIfNeed({ ledgerId: ledger.id, number })));
        }
    }

    private async getUnparsedBlocks(ledger: Ledger, start: number, end: number): Promise<Array<number>> {
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

    private async getLastBlockHeight(ledger: Ledger): Promise<number> {
        let api = await this.factory.get(ledger.id);
        return (await api.api.getBlockNumber());
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();
        this.stop();
    }
}
