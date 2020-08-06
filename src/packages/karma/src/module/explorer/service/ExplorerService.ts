import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DateUtil, ObjectUtil } from '@ts-core/common/util';
import { DatabaseService } from '../../database/DatabaseService';
import { StateChecker } from './StateChecker';
import { ITransport, Transport } from '@ts-core/common/transport';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { LedgerInfoEntity } from '../../database/entity/LedgerInfoEntity';
import { ILedgerInfo } from '../../database/entity/ILedgerInfo';
import * as _ from 'lodash';

@Injectable()
export class ExplorerService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constants
    //
    // --------------------------------------------------------------------------

    public static LEDGER_NAME = 'Karma';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createLedger(): Promise<ILedgerInfo> {
        let item = new LedgerInfoEntity();
        item.name = ExplorerService.LEDGER_NAME;
        item.blockHeight = 0;
        item.blockHeightParsed = 0;
        item.blockFrequency = 1 * DateUtil.MILISECONDS_SECOND;

        await this.database.ledgerSave(item);
        this.log(`Ledger "${item.name}" saved`);
        return item.toObject();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async ledgerGet(): Promise<ILedgerInfo> {
        let item = await this.database.ledgerInfo.findOne();
        return !_.isNil(item) ? item.toObject() : null;
    }

    public async initialize(): Promise<void> {
        let ledger = await this.ledgerGet();
        if (_.isNil(ledger)) {
            ledger = await this.createLedger();
        }

        let checker = new StateChecker(this.logger, this.transport, ledger.blockFrequency);
        checker.start();
    }
}
