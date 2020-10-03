import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DateUtil } from '@ts-core/common/util';
import { DatabaseService } from '../../database/DatabaseService';
import { Ledger } from '@hlf-explorer/common/ledger';
import { LedgerEntity } from '../../database/entity/LedgerEntity';
import { LedgerBlockMonitor } from './LedgerBlockMonitor';
import { LedgerStateChecker } from './LedgerStateChecker';
import { Transport } from '@ts-core/common/transport';
import { LedgerApiMonitor } from './LedgerApiMonitor';
import * as _ from 'lodash';
import { LedgerSettings, ILedgerConnectionSettings } from './LedgerSettings';
import { LedgerTransportFactory } from './LedgerTransportFactory';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerResetedEvent } from '../transport/event/LedgerResetedEvent';

@Injectable()
export class LedgerService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private monitors: Map<string, LedgerStateChecker>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(
        logger: Logger,
        private transport: Transport,
        private database: DatabaseService,
        private monitor: LedgerApiMonitor,
        private settings: LedgerSettings
    ) {
        super(logger);
        this.monitors = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createLedger(settings: ILedgerConnectionSettings): Promise<Ledger> {
        let item = new LedgerEntity();
        item.name = settings.name;
        item.blockHeight = 0;
        item.blockHeightParsed = 0;
        item.blockFrequency = 3 * DateUtil.MILISECONDS_SECOND;

        await this.database.ledgerSave(item);
        this.log(`Ledger "${settings.name}" saved`);
        return item.toObject();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        let names = this.settings.collection.map(item => item.name);
        this.log(`Initializing, found ${names.join(',')} ledgers...`);

        this.monitors.forEach(item => item.destroy());
        this.monitors.clear();

        let ledgers = [];
        for (let settings of this.settings.collection) {
            let ledger = (await this.ledgerGet(settings.name)) || (await this.createLedger(settings));
            settings.id = ledger.id;
            ledgers.push(ledger);

            let monitor = this.monitors.get(ledger.name);
            if (!this.monitors.has(ledger.name)) {
                monitor = new LedgerStateChecker(this.logger, this.transport, ledger);
                // monitor = new LedgerBlockMonitor(this.logger, this.transport, this.database, this.factory);
                this.monitors.set(ledger.name, monitor);
            }
            monitor.start();
        }

        await this.monitor.initialize(ledgers);
    }

    public async ledgerGet(name: string): Promise<Ledger> {
        let item = await this.database.ledger.findOne({ name });
        return !_.isNil(item) ? item.toObject() : null;
    }

    public async ledgerReset(name: string): Promise<Ledger> {
        let monitor = this.monitors.get(name);
        if (_.isNil(monitor)) {
            throw new ExtendedError(`Can't find monitor for "${name}" ledger`);
        }
        monitor.stop();

        let item = await this.database.ledger.findOne({ name });
        await this.database.ledgerBlock.delete({ ledgerId: item.id });
        await this.database.ledgerBlockEvent.delete({ ledgerId: item.id });
        await this.database.ledgerBlockTransaction.delete({ ledgerId: item.id });
        await this.database.ledger.update(item.id, { blockHeight: 0, blockHeightParsed: 0 });
        this.transport.dispatch(new LedgerResetedEvent({ ledgerId: item.id }));
        monitor.start();

        this.log(`Ledger ${name} reseted`);
        return item;
    }
}
