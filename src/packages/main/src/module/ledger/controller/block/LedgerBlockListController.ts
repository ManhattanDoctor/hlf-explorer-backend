import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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
import { TraceUtil } from '@ts-core/common/trace';
import { IsOptional, IsString } from 'class-validator';
import { LedgerBlock } from '@hlf-explorer/common/ledger';
import { LedgerBlockEntity } from '../../../../core/database/entity/LeggerBlockEntity';
import { DatabaseService } from '../../../../core/database/DatabaseService';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerService } from '../../service/LedgerService';
import * as _ from 'lodash';

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

    constructor(logger: Logger, private service: LedgerService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Ledger block list` })
    @ApiHeader({ name: `x-token`, description: `Authorization token`, required: true })
    @ApiUnauthorizedResponse({ description: `Authorization failed` })
    @ApiTooManyRequestsResponse({ description: `Too many requests` })
    @ApiForbiddenResponse({ description: `Access forbidden` })
    @ApiOkResponse({ type: LedgerBlockListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerBlockListDto): Promise<LedgerBlockListDtoResponse> {
        if (_.isNil(params.conditions)) {
            params.conditions = {};
        }
        params.conditions.ledgerId = this.service.ledgerId;
        return TypeormUtil.toPagination(
            this.database.ledgerBlock.createQueryBuilder('item').innerJoinAndSelect('item.transactions', 'transactions'),
            params,
            this.transform
        );
    }

    protected transform = async (value: LedgerBlockEntity): Promise<LedgerBlock> => {
        let item = TransformUtil.fromClass(value);
        item.rawData = null;
        return item;
    };
}
