import { Logger, LoggerWrapper, ExtendedError, DateUtil } from '@ts-core/common';
import { ILedgerConnectionSettings, LedgerSettingsFactory } from './LedgerSettingsFactory';
import { Injectable } from '@nestjs/common';
import { TransportFabric, TransportFabricBatch } from '@hlf-core/transport';
import { ChaincodeMetadataGetCommand, IChaincodeMetadata } from '@hlf-core/transport-common';
import { TRANSPORT_FABRIC_COMMAND_BATCH_NAME } from '@hlf-core/transport-common';
import * as _ from 'lodash';

@Injectable()
export class LedgerTransportFactory extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected items: Map<number, LedgerFabric>;
    protected promises: Map<number, Promise<LedgerFabric>>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private settings: LedgerSettingsFactory) {
        super(logger);
        this.items = new Map();
        this.promises = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async ledgerCreate(settings: ILedgerConnectionSettings): Promise<LedgerFabric> {
        let item = await this.ledgerAdd(new LedgerFabric(this.logger, _.assign({ isExitApplicationOnDisconnect: false }, settings)));

        let metadata: IChaincodeMetadata = null;
        try {
            metadata = await item.sendListen(new ChaincodeMetadataGetCommand());
        }
        catch (error) {
            item.destroy();
            throw error;
        }

        if (_.isNil(metadata.batch)) {
            return item;
        }
        if (_.isNil(settings.batch) || (_.isBoolean(settings.batch) && !settings.batch)) {
            throw new ExtendedError(`Batching for chaincode is "enabled", but there is no settings for it`);
        }
        item.destroy();

        return this.ledgerAdd(new LedgerFabricBatch(this.logger, settings));
    }

    protected async ledgerAdd<T extends TransportFabric>(item: T): Promise<T> {
        item.logCommandFilters.push(item => item.name !== TRANSPORT_FABRIC_COMMAND_BATCH_NAME);
        try {
            await item.connect();
        }
        catch (error) {
            item.destroy();
            throw error;
        }
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get(ledgerId: number): Promise<LedgerFabric> {
        let item = this.items.get(ledgerId);
        if (!_.isNil(item)) {
            return item;
        }
        let promise = this.promises.get(ledgerId);
        if (_.isNil(promise)) {
            promise = this.ledgerCreate(this.settings.getById(ledgerId)).finally(() => this.promises.delete(ledgerId));
            this.promises.set(ledgerId, promise);
        }
        item = await promise;
        if (!this.items.has(ledgerId)) {
            this.items.set(ledgerId, item);
            item.settings.timeout = DateUtil.MILLISECONDS_HOUR;
        }
        return item;
    }
}

export class LedgerFabric extends TransportFabric<ILedgerConnectionSettings> { }
export class LedgerFabricBatch extends TransportFabricBatch<ILedgerConnectionSettings> { }
