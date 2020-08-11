import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined, IsNumberString, IsString } from 'class-validator';
import { LedgerBlock, LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { ILedgerBlockTransactionGetResponse, ILedgerBlockTransactionGetRequest } from '@hlf-explorer/common/api/ledger/transaction';
import * as _ from 'lodash';
import { DatabaseService } from '../../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
import { Cache } from '@ts-core/backend-nestjs/cache';
import { Validator } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockTransactionGetRequest implements ILedgerBlockTransactionGetRequest {
    @ApiProperty()
    @IsString()
    hash: string;

    @ApiProperty()
    @IsNumberString()
    ledgerId: number;
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
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService) {
        super(logger);
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
        if (_.isNil(params.hash)) {
            throw new ExtendedError(`Block hash is nil`, HttpStatus.BAD_REQUEST);
        }
        /*
        let item = await this.cache.wrap<LedgerBlockTransaction>(this.getCacheKey(params), () => this.getItem(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        */

        let item = await this.getItem(params);
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find transaction "${params.hash}" hash`, HttpStatus.NOT_FOUND);
        }

        return { value: item };
    }


    private async getItem(params: ILedgerBlockTransactionGetRequest): Promise<LedgerBlockTransaction> {
        let conditions = { ledgerId: params.ledgerId, hash: params.hash };
        let item = await this.database.ledgerBlockTransaction.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
