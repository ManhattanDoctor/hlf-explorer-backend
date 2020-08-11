import { ExtendedError } from '@ts-core/common/error';
import { FilterableMapCollection } from '@ts-core/common/map';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { LedgerBlock, LedgerInfo } from '@hlf-explorer/common/ledger';
import * as _ from 'lodash';
import { TransformUtil } from '@ts-core/common/util';
import { ILogger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';

export class ApiMonitor extends LedgerApi {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static LEDGER_NAME = 'Karma';

    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private items: FilterableMapCollection<LedgerInfo>;
    private promise: PromiseHandler<void, ExtendedError>;

    private _ledger: LedgerInfo;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(logger: ILogger) {
        super(logger);
        this.items = new FilterableMapCollection('id');
    }

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        if (!_.isNil(this.promise)) {
            return this.promise.promise;
        }

        this.logger.log('Connecting to ledger socket...');
        this.connect();

        this.promise = PromiseHandler.create();
        return this.promise.promise;
    }

    //--------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //--------------------------------------------------------------------------

    protected ledgersHandler(items: Array<LedgerInfo>): void {
        super.ledgersHandler(items);

        this.items.clear();
        for (let item of items) {
            this.items.add(item);
        }

        if (_.isEmpty(this.items.collection)) {
            this.promise.reject(new ExtendedError(`Can't find any ledgers`));
            return;
        }

        this._ledger = _.find(this.items.collection, { name: ApiMonitor.LEDGER_NAME });
        if (_.isNil(this.ledger)) {
            this.promise.reject(new ExtendedError(`Can't find ${ApiMonitor.LEDGER_NAME} ledger any ledgers`));
            return;
        }

        this.settings.defaultLedgerId = this.ledger.id;
        this.promise.resolve();
    }

    protected exceptionHandler(error: ExtendedError): void {
        super.exceptionHandler(error);
        this.logger.warn(error.message, this.constructor.name);
    }

    protected socketConnectedHandler(event: any): void {
        super.socketConnectedHandler(event);
        this.logger.log(`Connected successfully to ledger socket`, this.constructor.name);
    }

    protected socketDisconnectedHandler(event: any): void {
        super.socketDisconnectedHandler(event);
        this.logger.error(`Disconnected from ledger socket: close application`, this.constructor.name);
        process.exit(0);
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    //--------------------------------------------------------------------------

    private get logger(): ILogger {
        return this.http;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get ledger(): LedgerInfo {
        return this._ledger;
    }
}
