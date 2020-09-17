import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { TransportFabricClient, ITransportFabricSettings } from '@hlf-core/transport/client';
import * as _ from 'lodash';

export class LedgerTransportFactory extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected items: Map<number, TransportFabricClient>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected settings: ITransportFabricSettings) {
        super(logger);
        this.items = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    // Override this method if you want to support different ledgers at the same time
    protected getSettings(ledgerId: number): ITransportFabricSettings {
        return this.settings;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get(ledgerId: number): Promise<TransportFabricClient> {
        let item = this.items.get(ledgerId);
        if (_.isNil(item)) {
            item = new TransportFabricClient(this.logger, this.getSettings(ledgerId));
            this.items.set(ledgerId, item);
        }

        await item.connect();
        return item;
    }
}
