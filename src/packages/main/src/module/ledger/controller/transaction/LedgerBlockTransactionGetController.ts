import { Controller, Get, Param, HttpStatus, Body, Inject, CACHE_MANAGER, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined, IsNumberString, IsString } from 'class-validator';
import { LedgerBlock, LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { ILedgerBlockTransactionGetResponse, ILedgerBlockTransactionGetRequest } from '@hlf-explorer/common/api/ledger/transaction';
import * as _ from 'lodash';
import { DatabaseService } from '../../../../core/database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { DateUtil, TransformUtil } from '@ts-core/common/util';
import { Cache } from '@ts-core/backend-nestjs/cache';
import { LedgerService } from '../../service/LedgerService';
import { Validator } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockTransactionGetRequest implements ILedgerBlockTransactionGetRequest {
    @ApiProperty()
    @IsString()
    hashOrUid: string;
}

export class LedgerBlockTransactionGetResponse implements ILedgerBlockTransactionGetResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlockTransaction;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/transaction')
export class LedgerBlockTransactionGetController extends DefaultController<LedgerBlockTransactionGetRequest, LedgerBlockTransactionGetResponse> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private validator: Validator;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private service: LedgerService, private cache: Cache) {
        super(logger);
        this.validator = new Validator();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Get block transaction by hash` })
    @ApiNotFoundResponse({ description: `Not found` })
    @ApiBadRequestResponse({ description: `Bad request` })
    @ApiOkResponse({ type: LedgerBlock })
    public async execute(@Query() params: LedgerBlockTransactionGetRequest): Promise<LedgerBlockTransactionGetResponse> {
        if (_.isNil(params.hashOrUid)) {
            throw new ExtendedError(`Block hash or uid is nil`, HttpStatus.BAD_REQUEST);
        }

        let transaction = await this.cache.wrap<LedgerBlockTransaction>(this.getCacheKey(params), () => this.getTransaction(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        if (_.isNil(transaction)) {
            throw new ExtendedError(`Unable to find transaction "${params.hashOrUid}" hash`, HttpStatus.NOT_FOUND);
        }

        return { value: transaction };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getCacheKey(params: ILedgerBlockTransactionGetRequest): string {
        return `${this.service.ledgerId}:transaction:${params.hashOrUid}`;
    }

    private async getTransaction(params: ILedgerBlockTransactionGetRequest): Promise<LedgerBlockTransaction> {
        let conditions: Partial<LedgerBlockTransaction> = { ledgerId: this.service.ledgerId };

        if (this.validator.isUUID(params.hashOrUid)) {
            conditions.requestId = params.hashOrUid;
        } else {
            conditions.hash = params.hashOrUid;
        }

        let item = await this.database.ledgerBlockTransaction.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
