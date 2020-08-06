import { Injectable } from '@nestjs/common';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { Connection, Repository } from 'typeorm';
import { Ledger, LedgerInfo } from '@hlf-explorer/common/ledger';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerInfoEntity } from './entity/LedgerInfoEntity';
import { LedgerBlockEntity } from './entity/LedgerBlockEntity';

@Injectable()
export class DatabaseService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private connection: Connection) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async ledgerSave(item: LedgerInfoEntity): Promise<void> {
        await TypeormUtil.validateEntity(item);
        await this.ledgerInfo.save(item);
    }

    public async ledgerUpdate(item: Partial<Ledger>): Promise<void> {
        if (_.isNil(item) || _.isNil(item.id)) {
            throw new ExtendedError(`Params doesn't contain required properties`);
        }
        await TypeormUtil.validateEntity(item);

        let query = this.ledgerInfo
            .createQueryBuilder()
            .update(item)
            .where('id = :id', { id: item.id });

        if (!_.isNil(item.blockHeightParsed)) {
            query.andWhere('blockHeightParsed < :blockHeightParsed', { blockHeightParsed: item.blockHeightParsed });
        }

        await query.execute();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public getConnection(): Connection {
        return this.connection;
    }

    public get ledgerInfo(): Repository<LedgerInfoEntity> {
        return this.connection.getRepository(LedgerInfoEntity);
    }

    public get ledgerBlock(): Repository<LedgerBlockEntity> {
        return this.connection.getRepository(LedgerBlockEntity);
    }
}
