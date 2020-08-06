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
import { LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { DatabaseService } from '../../../database/DatabaseService';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { LedgerService } from '../../service/LedgerService';
import * as _ from 'lodash';
import { LedgerBlockTransactionEntity } from '../../../database/entity/LedgerBlockTransactionEntity';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockTransactionListDto implements Paginable<LedgerBlockTransaction> {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<LedgerBlockTransaction>;

    @ApiPropertyOptional()
    sort?: FilterableSort<LedgerBlockTransaction>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class LedgerBlockTransactionListDtoResponse implements IPagination<LedgerBlockTransaction> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: LedgerBlockTransaction })
    items: Array<LedgerBlockTransaction>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/transactions')
export class LedgerBlockTransactionListController extends DefaultController<LedgerBlockTransactionListDto, LedgerBlockTransactionListDtoResponse> {
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
    @ApiOperation({ summary: `Ledger transactions list` })
    @ApiHeader({ name: `x-token`, description: `Authorization token`, required: true })
    @ApiUnauthorizedResponse({ description: `Authorization failed` })
    @ApiTooManyRequestsResponse({ description: `Too many requests` })
    @ApiForbiddenResponse({ description: `Access forbidden` })
    @ApiOkResponse({ type: LedgerBlockTransactionListDtoResponse })
    public async executeExtended(
        @Query({ transform: Paginable.transform }) params: LedgerBlockTransactionListDto
    ): Promise<LedgerBlockTransactionListDtoResponse> {
        if (_.isNil(params.conditions)) {
            params.conditions = {};
        }
        ObjectUtil.copyProperties({ ledgerId: this.service.ledgerId }, params.conditions);
        
        return TypeormUtil.toPagination(this.database.ledgerBlockTransaction.createQueryBuilder('item'), params, this.transform);
    }

    protected transform = async (value: LedgerBlockTransactionEntity): Promise<LedgerBlockTransaction> => {
        let item = TransformUtil.fromClass(value);
        item.rawData = null;
        return item;
    };
}
