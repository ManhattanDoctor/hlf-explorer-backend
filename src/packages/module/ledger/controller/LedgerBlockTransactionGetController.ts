import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Cache, DefaultController } from '@ts-core/backend-nestjs';
import { IsDefined, IsString, isUUID } from 'class-validator';
import { TRANSACTION_URL, LedgerBlock, ILedgerBlockTransactionGetResponse, ILedgerBlockTransactionGetRequest, LedgerBlockTransaction } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import { ExtendedError, Logger, DateUtil } from '@ts-core/common';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockTransactionGetRequest implements ILedgerBlockTransactionGetRequest {
    @ApiProperty()
    @IsString()
    public hash: string;

    @ApiProperty()
    @IsString()
    public ledgerName: string;
}

export class LedgerBlockTransactionGetResponse implements ILedgerBlockTransactionGetResponse {
    @ApiProperty()
    @IsDefined()
    public value: LedgerBlockTransaction;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(TRANSACTION_URL)
export class LedgerBlockTransactionGetController extends DefaultController<LedgerBlockTransactionGetRequest, LedgerBlockTransactionGetResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private cache: Cache) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Get block transaction by hash or requestId` })
    @ApiOkResponse({ type: LedgerBlock })
    public async executeExtended(@Query() params: LedgerBlockTransactionGetRequest): Promise<LedgerBlockTransactionGetResponse> {
        let value = await this.cache.wrap<LedgerBlockTransaction>(this.getCacheKey(params), () => this.getItem(params), { ttl: DateUtil.MILLISECONDS_DAY });
        return { value };
    }

    private async getItem(params: ILedgerBlockTransactionGetRequest): Promise<LedgerBlockTransaction> {
        let query = this.database.ledgerRelationAdd(this.database.ledgerBlockTransaction.createQueryBuilder('transaction'), params.ledgerName);
        if (isUUID(params.hash)) {
            query.andWhere('transaction.requestId = :requestId', { requestId: params.hash });
        }
        else {
            query.andWhere('transaction.hash = :hash', { hash: params.hash });
        }
        let item = await query.getOne();
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find transaction "${params.hash}" hash`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        return !_.isNil(item) ? item.toObject() : null;
    }

    private getCacheKey(params: ILedgerBlockTransactionGetRequest): string {
        return `${params.ledgerName}:${params.hash}`;
    }
}
