import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { FabricApi, IFabricApiSettings } from '@ts-core/blockchain-fabric/api';
import { DatabaseService } from '../../../core/database/DatabaseService';

export class LedgerApiFactory extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected items: Map<number, FabricApi>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, protected database: DatabaseService, protected settings: IFabricApiSettings) {
        super(logger);
        this.items = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    // Override this method if you want to support defferent ledgers at the same time
    protected getSettings(ledgerId: number): IFabricApiSettings {
        return this.settings;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get(ledgerId: number): Promise<FabricApi> {
        let item = this.items.get(ledgerId);
        if (!item) {
            item = new FabricApi(this.logger, this.getSettings(ledgerId));
            this.items.set(ledgerId, item);
        }

        await item.connect();
        return item;
    }
}
