import { Injectable } from '@nestjs/common';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, ExtendedError, LoggerWrapper } from '@ts-core/common';
import { Connection, SelectQueryBuilder, Repository, UpdateResult } from 'typeorm';
import { LedgerEntity } from '../ledger';
import { LedgerBlockEntity, LedgerBlockEventEntity, LedgerBlockRawEntity, LedgerBlockTransactionEntity } from '../block';
import { Ledger } from '@hlf-explorer/common';
import * as _ from 'lodash';

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

    public async ledgerUpdate(item: Partial<Ledger>): Promise<UpdateResult> {
        if (_.isNil(item) || _.isNil(item.id)) {
            throw new ExtendedError(`Params doesn't contain required properties`);
        }
        await TypeormUtil.validateEntity(item);
        let query = this.ledger.createQueryBuilder().update(item).where('id = :id', { id: item.id });
        if (!_.isNil(item.blockHeightParsed)) {
            query.andWhere('blockHeightParsed < :blockHeightParsed', { blockHeightParsed: item.blockHeightParsed });
        }
        return query.execute();
    }

    public ledgerRelationAdd<T = any>(query: SelectQueryBuilder<T>, name: string): SelectQueryBuilder<T> {
        query.innerJoin(`${query.alias}.ledger`, 'ledger')
        query.where('ledger.name = :name', { name });
        return query;
    }

    public ledgerBlockRelationsAdd<T = any>(query: SelectQueryBuilder<T>): void {
        query.leftJoinAndSelect('block.events', 'event');
        query.leftJoinAndSelect('block.transactions', 'transactions');
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public getConnection(): Connection {
        return this.connection;
    }

    public get ledger(): Repository<LedgerEntity> {
        return this.connection.getRepository(LedgerEntity);
    }

    public get ledgerBlock(): Repository<LedgerBlockEntity> {
        return this.connection.getRepository(LedgerBlockEntity);
    }

    public get ledgerBlockRaw(): Repository<LedgerBlockRawEntity> {
        return this.connection.getRepository(LedgerBlockRawEntity);
    }

    public get ledgerBlockEvent(): Repository<LedgerBlockEventEntity> {
        return this.connection.getRepository(LedgerBlockEventEntity);
    }

    public get ledgerBlockTransaction(): Repository<LedgerBlockTransactionEntity> {
        return this.connection.getRepository(LedgerBlockTransactionEntity);
    }
}
