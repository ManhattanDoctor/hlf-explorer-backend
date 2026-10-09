import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DefaultController, Cache } from '@ts-core/backend-nestjs';
import { Logger, ExtendedError, DateUtil } from '@ts-core/common';
import { IsString, IsDefined } from 'class-validator';
import { EVENT_URL, LedgerBlockEvent, ILedgerBlockEventGetResponse, ILedgerBlockEventGetRequest } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockEventGetRequest implements ILedgerBlockEventGetRequest {
    @ApiProperty()
    @IsString()
    public uid: string;

    @ApiProperty()
    @IsString()
    public ledgerName: string;
}

export class LedgerBlockEventGetResponse implements ILedgerBlockEventGetResponse {
    @ApiProperty()
    @IsDefined()
    public value: LedgerBlockEvent;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(EVENT_URL)
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
    @ApiOkResponse({ type: LedgerBlockEvent })
    public async executeExtended(@Query() params: LedgerBlockEventGetRequest): Promise<LedgerBlockEventGetResponse> {
        let value = await this.cache.wrap<LedgerBlockEvent>(this.getCacheKey(params), () => this.getItem(params), { ttl: DateUtil.MILLISECONDS_DAY });
        return { value };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getCacheKey(params: ILedgerBlockEventGetRequest): string {
        return `${params.ledgerName}:event:${params.uid}`;
    }

    private async getItem(params: ILedgerBlockEventGetRequest): Promise<LedgerBlockEvent> {
        let query = this.database.ledgerRelationAdd(this.database.ledgerBlockEvent.createQueryBuilder('event'), params.ledgerName);
        query.andWhere('event.uid = :uid', { uid: params.uid });

        let item = await query.getOne();
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find event "${params.uid}" uid`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        return !_.isNil(item) ? item.toObject() : null;
    }
}
