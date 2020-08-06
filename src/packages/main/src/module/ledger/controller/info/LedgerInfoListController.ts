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
import { LedgerInfo } from '@hlf-explorer/common/ledger';
import { DatabaseService } from '../../../database/DatabaseService';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { LedgerService } from '../../service/LedgerService';
import * as _ from 'lodash';
import { LedgerEntity } from '../../../database/entity/LedgerEntity';
import { LedgerMonitorService } from '../../service/LedgerMonitorService';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerInfoListDto implements Paginable<LedgerInfo> {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<LedgerInfo>;

    @ApiPropertyOptional()
    sort?: FilterableSort<LedgerInfo>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class LedgerInfoListDtoResponse implements IPagination<LedgerInfo> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: LedgerInfo })
    items: Array<LedgerInfo>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/infos')
export class LedgerInfoListController extends DefaultController<LedgerInfoListDto, LedgerInfoListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: LedgerService, private monitor: LedgerMonitorService, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Ledger info list` })
    @ApiHeader({ name: `x-token`, description: `Authorization token`, required: true })
    @ApiUnauthorizedResponse({ description: `Authorization failed` })
    @ApiTooManyRequestsResponse({ description: `Too many requests` })
    @ApiForbiddenResponse({ description: `Access forbidden` })
    @ApiOkResponse({ type: LedgerInfoListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerInfoListDto): Promise<LedgerInfoListDtoResponse> {
        if (_.isNil(params.conditions)) {
            params.conditions = {};
        }
        return TypeormUtil.toPagination(this.database.ledger.createQueryBuilder('item'), params, this.transform);
    }

    protected transform = async (value: LedgerEntity): Promise<LedgerInfo> => {
        return TransformUtil.fromClass(await this.monitor.getInfo(value.id));
    };
}
