import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiForbiddenResponse,
    ApiHeader,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiPropertyOptional,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common/dto';
import { Logger } from '@ts-core/common/logger';
import { IsOptional, IsString } from 'class-validator';
import { LedgerBlock } from '@hlf-explorer/common/ledger';
import { LedgerBlockEntity } from '../../../database/entity/LeggerBlockEntity';
import { DatabaseService } from '../../../database/DatabaseService';
import { TransformUtil } from '@ts-core/common/util';
import * as _ from 'lodash';
import { LedgerGuardPaginable } from '../../service/guard/LedgerGuardPaginable';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockListDto implements Paginable<LedgerBlock> {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<LedgerBlock>;

    @ApiPropertyOptional()
    sort?: FilterableSort<LedgerBlock>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class LedgerBlockListDtoResponse implements IPagination<LedgerBlock> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: LedgerBlock })
    items: Array<LedgerBlock>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/blocks')
export class LedgerBlockListController extends DefaultController<LedgerBlockListDto, LedgerBlockListDtoResponse> {
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
    @ApiOperation({ summary: `Ledger block list` })
    @ApiOkResponse({ type: LedgerBlockListDtoResponse })
    @UseGuards(LedgerGuardPaginable)
    public async executeExtended(
        @Query({ transform: Paginable.transform }) params: LedgerBlockListDto
    ): Promise<LedgerBlockListDtoResponse> {
        let query = this.database.ledgerBlock
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.events', 'events')
            .leftJoinAndSelect('item.transactions', 'transactions');
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (value: LedgerBlockEntity): Promise<LedgerBlock> => {
        let item = TransformUtil.fromClass(value);
        item.rawData = null;
        return item;
    };
}
