import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { DateUtil, Logger } from '@ts-core/common';
import { IsDefined } from 'class-validator';
import { Ledger, ILedgerGetResponse, ILedgerGetRequest, LEDGER_URL } from '@hlf-explorer/common';
import { ExtendedError } from '@ts-core/common';
import { Cache } from '@ts-core/backend-nestjs';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerGetRequest implements ILedgerGetRequest {
    @ApiProperty()
    @IsDefined()
    public nameOrId: number | string;
}

export class LedgerGetResponse implements ILedgerGetResponse {
    @ApiProperty()
    @IsDefined()
    public value: Ledger;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(LEDGER_URL)
export class LedgerGetController extends DefaultController<LedgerGetRequest, LedgerGetResponse> {
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
    @ApiOperation({ summary: `Get ledger by name or id` })
    @ApiOkResponse({ type: Ledger })
    public async executeExtended(@Query() params: LedgerGetRequest): Promise<LedgerGetResponse> {
        let value = await this.cache.wrap<Ledger>(this.getCacheKey(params), () => this.getItem(params), { ttl: DateUtil.MILLISECONDS_MINUTE });
        return { value };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getCacheKey(params: ILedgerGetRequest): string {
        return `${params.nameOrId}`;
    }

    private async getItem(params: ILedgerGetRequest): Promise<Ledger> {
        let query = this.database.ledger.createQueryBuilder('ledger');

        if (!_.isNaN(Number(params.nameOrId))) {
            query.andWhere('ledger.id = :id', { id: Number(params.nameOrId) });
        } else {
            query.andWhere('ledger.name = :name', { name: params.nameOrId.toString() });
        }
        let item = await query.getOne();
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find ledger "${params.nameOrId}" name or id`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        return !_.isNil(item) ? item.toObject() : null;
    }
}
