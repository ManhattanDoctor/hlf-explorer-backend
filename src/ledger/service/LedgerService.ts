import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DateUtil } from '@ts-core/common/util';
import { DatabaseService } from '../../database/DatabaseService';
import { Ledger } from '@hlf-explorer/common/ledger';
import { LedgerEntity } from '../../database/entity/LedgerEntity';
import { LedgerStateChecker } from './LedgerStateChecker';
import { Transport } from '@ts-core/common/transport';
import { LedgerApiMonitor } from './LedgerApiMonitor';
import * as _ from 'lodash';

@Injectable()
export class LedgerService extends LoggerWrapper {
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

    private async createLedger(name: string): Promise<Ledger> {
        let item = new LedgerEntity();
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
        let items = [];
        for (let name of ['Karma']) {
            let item = await this.ledgerGet(name);
            if (_.isNil(item)) {
                item = await this.createLedger(name);
            }
            items.push(item);
        }
        items.forEach(item => {
            let checker = new LedgerStateChecker(this.logger, this.transport, item);
            checker.start();
        });
        await this.monitor.initialize(items);
    }
    
    public async ledgerGet(name: string): Promise<Ledger> {
        let item = await this.database.ledger.findOne({ name });
        return !_.isNil(item) ? item.toObject() : null;
    }
}
