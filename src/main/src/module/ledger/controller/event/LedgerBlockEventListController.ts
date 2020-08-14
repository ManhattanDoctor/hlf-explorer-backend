import { Controller, Get, Query } from '@nestjs/common';
import {
    ApiForbiddenResponse,
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiPropertyOptional,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common/dto';
import { Logger } from '@ts-core/common/logger';
import { IsOptional, IsString } from 'class-validator';
import { LedgerBlockEvent } from '@hlf-explorer/common/ledger';
import { DatabaseService } from '../../../database/DatabaseService';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { LedgerService } from '../../service/LedgerService';
import * as _ from 'lodash';
import { LedgerBlockEventEntity } from '../../../database/entity/LedgerBlockEventEntity';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockEventListDto implements Paginable<LedgerBlockEvent> {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<LedgerBlockEvent>;

    @ApiPropertyOptional()
    sort?: FilterableSort<LedgerBlockEvent>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class LedgerBlockEventListDtoResponse implements IPagination<LedgerBlockEvent> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: LedgerBlockEvent })
    items: Array<LedgerBlockEvent>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/events')
export class LedgerBlockEventListController extends DefaultController<LedgerBlockEventListDto, LedgerBlockEventListDtoResponse> {
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
    @ApiOperation({ summary: `Ledger events list` })
    @ApiHeader({ name: `x-token`, description: `Authorization token`, required: true })
    @ApiUnauthorizedResponse({ description: `Authorization failed` })
    @ApiTooManyRequestsResponse({ description: `Too many requests` })
    @ApiForbiddenResponse({ description: `Access forbidden` })
    @ApiOkResponse({ type: LedgerBlockEventListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerBlockEventListDto): Promise<LedgerBlockEventListDtoResponse> {
        if (_.isNil(params.conditions)) {
            params.conditions = {};
        }

        let query = this.database.ledgerBlockEvent.createQueryBuilder('item');
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (value: LedgerBlockEventEntity): Promise<LedgerBlockEvent> => {
        let item = TransformUtil.fromClass(value);
        item.rawData = null;
        return item;
    };
}
