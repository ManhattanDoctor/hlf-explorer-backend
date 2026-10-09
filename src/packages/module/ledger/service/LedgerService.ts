import { Injectable } from '@nestjs/common';
import { Logger, ExtendedError, Transport, DateUtil, LoggerWrapper } from '@ts-core/common';
import { DatabaseService } from '@project/module/database/service';
import { Ledger } from '@hlf-explorer/common';
import { LedgerStateChecker } from './LedgerStateChecker';
import { LedgerApiMonitor } from './LedgerApiMonitor';
import { LedgerSettingsFactory, ILedgerConnectionSettings } from './LedgerSettingsFactory';
import { LedgerResetedEvent } from '../transport';
import { LedgerBatchChecker } from './LedgerBatchChecker';
import { LedgerEntity } from '@project/module/database/ledger';
import { LedgerFabric, LedgerTransportFactory } from './LedgerTransportFactory';
import * as _ from 'lodash';

@Injectable()
export class LedgerService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private checkers: Map<string, LedgerStateChecker>;
    private batchers: Map<string, LedgerBatchChecker>;
    private batcherTimers: Map<string, any>;

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
        private settings: LedgerSettingsFactory,
        private factory: LedgerTransportFactory,
    ) {
        super(logger);
        this.checkers = new Map();
        this.batchers = new Map();
        this.batcherTimers = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createLedger(settings: ILedgerConnectionSettings): Promise<Ledger> {
        let item = new LedgerEntity();
        item.name = settings.uid;
        item.blockHeight = item.blockHeightParsed = 0;
        item.blockFrequency = 3 * DateUtil.MILLISECONDS_SECOND;
        if (!_.isNil(settings.batch)) {
            item.isBatch = _.isBoolean(settings.batch) ? settings.batch : true;
        }

        await this.database.ledger.save(item);
        this.log(`Ledger "${settings.uid}" saved`);
        return item.toObject();
    }

    private async initializeBatchers(ledgers: Array<Ledger>): Promise<void> {
        this.batcherTimers.forEach(item => clearTimeout(item));
        this.batcherTimers.clear();
        this.batchers.forEach(item => item.destroy());
        this.batchers.clear();

        for (let ledger of ledgers) {
            this.initializeBatcher(ledger);
        }
    }

    private async initializeBatcher(ledger: Ledger): Promise<void> {
        this.batcherTimers.delete(ledger.name);

        let api: LedgerFabric;
        try {
            api = await this.factory.get(ledger.id);
        }
        catch (error) {
            this.warn(`Ledger "${ledger.name}" is unavailable, retry in ${ledger.blockFrequency}ms: ${error.message}`);
            this.batcherTimers.set(ledger.name, setTimeout(() => this.initializeBatcher(ledger), ledger.blockFrequency));
            return;
        }
        if (api instanceof LedgerFabric) {
            return;
        }

        let item = new LedgerBatchChecker(this.logger, this.transport, ledger, this.settings.get(ledger.name).batch);
        this.batchers.set(ledger.name, item);
        item.start();
    }

    private async initializeCheckers(ledgers: Array<Ledger>): Promise<void> {
        this.checkers.forEach(item => item.destroy());
        this.checkers.clear();

        for (let ledger of ledgers) {
            let item = this.checkers.get(ledger.name);
            if (!this.checkers.has(ledger.name)) {
                item = new LedgerStateChecker(this.logger, this.transport, ledger);
                this.checkers.set(ledger.name, item);
            }
            item.start();
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        let names = this.settings.items.collection.map(item => item.uid);
        this.log(`Initializing, found ${names.join(',')} ledgers...`);

        this.checkers.forEach(item => item.destroy());
        this.checkers.clear();

        let items = new Array();
        for (let settings of this.settings.items.collection) {
            let item = await this.createLedgerIfNeed(settings);
            settings.id = item.id;
            items.push(item);
        }
        await this.initializeBatchers(items);
        await this.initializeCheckers(items);
        await this.monitor.initialize(items);
    }

    public async createLedgerIfNeed(settings: ILedgerConnectionSettings): Promise<Ledger> {
        let item = await this.ledgerGet(settings.uid);
        if (_.isNil(item)) {
            item = await this.createLedger(settings);
        }
        return item;
    }

    public async ledgerGet(name: string): Promise<Ledger> {
        let item = await this.database.ledger.findOneBy({ name });
        return !_.isNil(item) ? item.toObject() : null;
    }

    public async ledgerReset(name: string): Promise<Ledger> {
        let item = await this.database.ledger.findOneBy({ name });
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find "${name}" ledger`);
        }

        let checkers = _.compact([this.checkers.get(name), this.batchers.get(name)]);
        checkers.forEach(item => item.stop());

        await this.database.ledgerBlockTransaction.delete({ ledgerId: item.id });
        await this.database.ledgerBlockEvent.delete({ ledgerId: item.id });
        await this.database.ledgerBlock.delete({ ledgerId: item.id });

        await this.database.ledger.update(item.id, { blockHeight: 0, blockHeightParsed: 0 });
        this.transport.dispatch(new LedgerResetedEvent({ ledgerId: item.id }));

        checkers.forEach(item => item.start());

        this.log(`Ledger ${name} reseted`);
        return item;
    }
}
