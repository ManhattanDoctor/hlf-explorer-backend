import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DateUtil } from '@ts-core/common/util';
import { DatabaseService } from '../../database/DatabaseService';
import { Ledger } from '@hlf-explorer/common/ledger';
import { LedgerEntity } from '../../database/entity/LedgerEntity';
import { LedgerStateChecker } from './LedgerStateChecker';
import { Transport } from '@ts-core/common/transport';
import { LedgerApiMonitor } from './LedgerApiMonitor';

@Injectable()
export class LedgerService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private ledger: Ledger;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private monitor: LedgerApiMonitor) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async ledgerGet(name: string): Promise<Ledger> {
        let item = await this.database.ledger.findOne({ name });
        if (item) {
            return item.toObject();
        }

        item = new LedgerEntity();
        item.name = name;
        item.blockHeight = 0;
        item.blockHeightParsed = 0;
        item.blockFrequency = 3 * DateUtil.MILISECONDS_SECOND;

        await this.database.ledgerSave(item);
        this.log(`Ledger "${name}" saved`);
        return item.toObject();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        let karma = (this.ledger = await this.ledgerGet('Karma'));
        await this.monitor.initialize([karma]);

        let checker = new LedgerStateChecker(this.logger, this.transport, karma);
        checker.start();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get ledgerId(): number {
        return this.ledger.id;
    }
}
