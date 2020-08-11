import { Injectable } from '@nestjs/common';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { EntityManager, Connection, Repository } from 'typeorm';
import { Ledger, LedgerInfo } from '@hlf-explorer/common/ledger';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';
import { LedgerInfoEntity } from './entity/LedgerInfoEntity';
import { LedgerBlockEntity } from './entity/LedgerBlockEntity';
import { LedgerActionEntity } from './entity/LedgerActionEntity';

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

    public async ledgerUpdate(item: Partial<Ledger>, manager?: EntityManager): Promise<void> {
        if (_.isNil(item) || _.isNil(item.id)) {
            throw new ExtendedError(`Params doesn't contain required properties`);
        }
        await TypeormUtil.validateEntity(item);

        let repository = !_.isNil(manager) ? manager.getRepository(LedgerInfoEntity) : this.ledgerInfo;
        let query = repository
            .createQueryBuilder()
            .update(item)
            .where('id = :id', { id: item.id });

        if (!_.isNil(item.blockHeightParsed)) {
            query.andWhere('blockHeightParsed < :blockHeightParsed', { blockHeightParsed: item.blockHeightParsed });
        }
        await query.execute();
    }

    public async ledgerBlockSave(item: LedgerBlockEntity): Promise<void> {
        await TypeormUtil.validateEntity(item);
        await this.ledgerBlock.save(item);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public getConnection(): Connection {
        return this.connection;
    }

    public get ledgerAction(): Repository<LedgerActionEntity> {
        return this.connection.getRepository(LedgerActionEntity);
    }

    public get ledgerInfo(): Repository<LedgerInfoEntity> {
        return this.connection.getRepository(LedgerInfoEntity);
    }

    public get ledgerBlock(): Repository<LedgerBlockEntity> {
        return this.connection.getRepository(LedgerBlockEntity);
    }
}
