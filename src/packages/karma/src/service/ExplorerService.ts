import { Injectable } from '@nestjs/common';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { DateUtil, ObjectUtil } from '@ts-core/common/util';
import { DatabaseService } from '../database/DatabaseService';
import { StateChecker } from './StateChecker';
import { ITransport, Transport } from '@ts-core/common/transport';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { LedgerInfoEntity } from '../database/entity/LedgerInfoEntity';
import { ILedgerInfo } from '../database/entity/ILedgerInfo';
import * as _ from 'lodash';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { Ledger } from '@hlf-explorer/common/ledger';
import { ApiMonitor } from './ApiMonitor';

@Injectable()
export class ExplorerService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService, private api: LedgerApi) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private async createLedger(): Promise<ILedgerInfo> {
        let item = new LedgerInfoEntity();
        item.name = ApiMonitor.LEDGER_NAME;
        item.blockHeight = 0;
        item.blockHeightParsed = 0;
        item.blockFrequency = 1 * DateUtil.MILISECONDS_SECOND;

        await this.database.ledgerSave(item);
        this.log(`Ledger "${item.name}" saved`);
        return item.toObject();
    }

    private async checkBlocks(): Promise<void> {
        let blocks = await this.getUnparsedBlocks(0, await this.getLastBlockHeight());
        if (!_.isEmpty(blocks)) {
            this.warn(`Blocks ${blocks.join(', ')} are not parsed: need to parse it manually`);
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Blocks Methods
    //
    // --------------------------------------------------------------------------

    public async getLastBlockHeight(): Promise<number> {
        let item = await this.api.getInfo(ApiMonitor.LEDGER_NAME);
        return item.blockLast.number;
    }

    public async getUnparsedBlocks(start: number, end: number): Promise<Array<number>> {
        let blocksToCheck = _.range(start, end + 1);
        let items = await Promise.all(
            _.chunk(blocksToCheck, TypeormUtil.POSTGRE_FORIN_MAX).map(chunk =>
                this.database.ledgerBlock
                    .createQueryBuilder('block')
                    .select(['block.number'])
                    .where('block.number IN (:...blockNumbers)', { blockNumbers: chunk })
                    .getMany()
            )
        );
        let blocks: Array<number> = _.flatten(items).map(item => item.number);
        return blocksToCheck.filter(blockHeight => !blocks.includes(blockHeight));
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

        await this.checkBlocks();

        let checker = new StateChecker(this.logger, this.transport, ledger.blockFrequency);
        checker.start();
    }
}
