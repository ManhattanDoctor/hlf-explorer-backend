import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Cache, DefaultController } from '@ts-core/backend-nestjs';
import { Logger, ExtendedError, DateUtil } from '@ts-core/common';
import { IsDefined, IsString } from 'class-validator';
import { BLOCK_URL, LedgerBlock, ILedgerBlockGetResponse, ILedgerBlockGetRequest } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockGetRequest implements ILedgerBlockGetRequest {
    @ApiProperty()
    @IsDefined()
    public hashOrNumber: number | string;

    @ApiProperty()
    @IsString()
    public ledgerName: string;
}

export class LedgerBlockGetResponse implements ILedgerBlockGetResponse {
    @ApiProperty()
    @IsDefined()
    public value: LedgerBlock;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Block')
@Controller(BLOCK_URL)
export class LedgerBlockGetController extends DefaultController<LedgerBlockGetRequest, LedgerBlockGetResponse> {
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
    @ApiOperation({ summary: `Get ledger block by number or hash` })
    @ApiOkResponse({ type: LedgerBlock })
    public async executeExtended(@Query() params: LedgerBlockGetRequest): Promise<LedgerBlockGetResponse> {
        let value = await this.cache.wrap<LedgerBlock>(this.getCacheKey(params), () => this.getItem(params), { ttl: DateUtil.MILLISECONDS_DAY });
        return { value };
    }

    private async getItem(params: ILedgerBlockGetRequest): Promise<LedgerBlock> {
        let query = this.database.ledgerRelationAdd(this.database.ledgerBlock.createQueryBuilder('block'), params.ledgerName);
        this.database.ledgerBlockRelationsAdd(query);
        query.addOrderBy('event.id', 'ASC');
        query.addOrderBy('transactions.id', 'ASC');

        if (!_.isNaN(Number(params.hashOrNumber))) {
            query.andWhere('block.number = :number', { number: Number(params.hashOrNumber) });
        } else {
            query.andWhere('block.hash = :hash', { hash: params.hashOrNumber.toString() });
        }
        let item = await query.getOne();
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find block "${params.hashOrNumber}" hash or number`, ExtendedError.HTTP_CODE_NOT_FOUND);
        }
        return !_.isNil(item) ? item.toObject() : null;
    }

    private getCacheKey(params: ILedgerBlockGetRequest): string {
        return `${params.ledgerName}:${params.hashOrNumber}`;
    }
}
