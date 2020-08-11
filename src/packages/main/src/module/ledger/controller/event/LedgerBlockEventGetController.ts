import { Controller, Get, Param, HttpStatus, Body, Inject, CACHE_MANAGER, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsNumberString, IsDefined } from 'class-validator';
import { LedgerBlock, LedgerBlockEvent } from '@hlf-explorer/common/ledger';
import { ILedgerBlockEventGetResponse, ILedgerBlockEventGetRequest } from '@hlf-explorer/common/api/ledger/event';
import * as _ from 'lodash';
import { DatabaseService } from '../../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { DateUtil, TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { Cache } from '@ts-core/backend-nestjs/cache';
import { LedgerService } from '../../service/LedgerService';
import { IsUUID, Validator } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockEventGetRequest implements ILedgerBlockEventGetRequest {
    @ApiProperty()
    @IsUUID()
    uid: string;

    @ApiProperty()
    @IsNumberString()
    ledgerId: number;
}

export class LedgerBlockEventGetResponse implements ILedgerBlockEventGetResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlockEvent;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/event')
export class LedgerBlockEventGetController extends DefaultController<LedgerBlockEventGetRequest, LedgerBlockEventGetResponse> {
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
    @ApiOperation({ summary: `Get block event by uid` })
    @ApiNotFoundResponse({ description: `Not found` })
    @ApiBadRequestResponse({ description: `Bad request` })
    @ApiOkResponse({ type: LedgerBlock })
    public async execute(@Query() params: LedgerBlockEventGetRequest): Promise<LedgerBlockEventGetResponse> {
        /*
        let item = await this.cache.wrap<LedgerBlockEvent>(this.getCacheKey(params), () => this.getItem(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        */
        let item = await this.getItem(params);
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find event "${params.uid}" uid`, HttpStatus.NOT_FOUND);
        }
        return { value: item };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getCacheKey(params: ILedgerBlockEventGetRequest): string {
        return `${params.ledgerId}:event:${params.uid}`;
    }

    private async getItem(params: ILedgerBlockEventGetRequest): Promise<LedgerBlockEvent> {
        let conditions = { ledgerId: params.ledgerId, uid: params.uid } as Partial<LedgerBlockEvent>;
        let item = await this.database.ledgerBlockEvent.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
