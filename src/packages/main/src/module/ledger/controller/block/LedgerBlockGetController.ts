import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined } from 'class-validator';
import { LedgerBlock } from '@hlf-explorer/common/ledger';
import { ILedgerBlockGetResponse, ILedgerBlockGetRequest } from '@hlf-explorer/common/api/ledger/block';
import * as _ from 'lodash';
import { DatabaseService } from '../../../../core/database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { DateUtil, TransformUtil } from '@ts-core/common/util';
import { Cache } from '@ts-core/backend-nestjs/cache';
import { LedgerService } from '../../service/LedgerService';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockGetRequest implements ILedgerBlockGetRequest {
    @ApiProperty()
    @IsDefined()
    numberOrHash: number | string;
}

export class LedgerBlockGetResponse implements ILedgerBlockGetResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlock;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/block')
export class LedgerBlockGetController extends DefaultController<LedgerBlockGetRequest, LedgerBlockGetResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private database: DatabaseService, private service: LedgerService, private cache: Cache) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Get ledger block by number or hash` })
    @ApiNotFoundResponse({ description: `Not found` })
    @ApiBadRequestResponse({ description: `Bad request` })
    @ApiOkResponse({ type: LedgerBlock })
    public async execute(@Query() params: LedgerBlockGetRequest): Promise<LedgerBlockGetResponse> {
        if (_.isNil(params.numberOrHash)) {
            throw new ExtendedError(`Block hash or number is nil`, HttpStatus.BAD_REQUEST);
        }

        let block = await this.cache.wrap<LedgerBlock>(this.getCacheKey(params), () => this.getBlock(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        if (_.isNil(block)) {
            throw new ExtendedError(`Unable to find block "${params.numberOrHash}" hash or number`, HttpStatus.NOT_FOUND);
        }

        return { value: block };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getCacheKey(params: ILedgerBlockGetRequest): string {
        return `${this.service.ledgerId}:block:${params.numberOrHash}`;
    }

    private async getBlock(params: ILedgerBlockGetRequest): Promise<LedgerBlock> {
        let conditions: Partial<LedgerBlock> = { ledgerId: this.service.ledgerId };
        if (!_.isNaN(Number(params.numberOrHash))) {
            conditions.number = Number(params.numberOrHash);
        } else {
            conditions.hash = params.numberOrHash.toString();
        }
        let item = await this.database.ledgerBlock.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
