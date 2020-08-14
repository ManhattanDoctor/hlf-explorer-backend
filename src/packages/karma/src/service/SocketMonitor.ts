import { ExtendedError } from '@ts-core/common/error';
import { FilterableMapCollection } from '@ts-core/common/map';
import { LedgerApi, LedgerApiSocket } from '@hlf-explorer/common/api';
import { LedgerBlock, LedgerInfo } from '@hlf-explorer/common/ledger';
import * as _ from 'lodash';
import { TransformUtil } from '@ts-core/common/util';
import { ILogger } from '@ts-core/common/logger';
import { PromiseHandler } from '@ts-core/common/promise';

export class SocketMonitor extends LedgerApiSocket {
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

    private promise: PromiseHandler<void, ExtendedError>;
    private _ledger: LedgerInfo;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(logger: ILogger, private api: LedgerApi) {
        super(logger);
        this.url = api.url;
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

    protected ledgerListReceivedHandler(items: Array<LedgerInfo>): void {
        super.ledgerListReceivedHandler(items);

        if (_.isEmpty(items)) {
            this.promise.reject(new ExtendedError(`Can't find any ledgers`));
            return;
        }

        this._ledger = _.find(items, { name: SocketMonitor.LEDGER_NAME });
        if (_.isNil(this.ledger)) {
            this.promise.reject(new ExtendedError(`Can't find ${SocketMonitor.LEDGER_NAME} ledger any ledgers`));
            return;
        }

        this.settings.filterLedgerId = this.api.settings.defaultLedgerId = this.ledger.id;
        this.promise.resolve();
    }

    protected socketConnectedHandler(): void {
        super.socketConnectedHandler();
        this.logger.log(`Connected successfully to ledger socket`, this.constructor.name);
    }

    protected socketDisconnectedHandler(): void {
        super.socketDisconnectedHandler();
        this.logger.error(`Disconnected from ledger socket: close application`, this.constructor.name);
        process.exit(0);
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
