import { Controller, Get, Param, HttpStatus, Body, Inject, CACHE_MANAGER, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsString, IsDefined } from 'class-validator';
import { LedgerBlock, LedgerBlockEvent, Ledger } from '@hlf-explorer/common/ledger';
import { ILedgerBlockEventGetResponse, ILedgerBlockEventGetRequest } from '@hlf-explorer/common/api/event';
import * as _ from 'lodash';
import { DatabaseService } from '../../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
import { Cache } from '@ts-core/backend-nestjs/cache';
import { IsUUID } from 'class-validator';
import { LedgerGuard, ILedgerHolder } from '../../service/guard/LedgerGuard';

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
    @IsString()
    ledgerName: string;
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
    @ApiOkResponse({ type: LedgerBlock })
    @UseGuards(LedgerGuard)
    public async executeExtended(
        @Query() params: LedgerBlockEventGetRequest,
        @Req() holder: ILedgerHolder
    ): Promise<LedgerBlockEventGetResponse> {
        /*
        let item = await this.cache.wrap<LedgerBlockEvent>(this.getCacheKey(params), () => this.getItem(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        */
        let item = await this.getItem(params, holder.ledger.id);
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
        return `${params.ledgerName}:event:${params.uid}`;
    }

    private async getItem(params: ILedgerBlockEventGetRequest, ledgerId: number): Promise<LedgerBlockEvent> {
        let conditions = { uid: params.uid, ledgerId } as Partial<LedgerBlockEvent>;
        let item = await this.database.ledgerBlockEvent.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
