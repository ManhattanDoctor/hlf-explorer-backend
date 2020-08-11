import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { TypeormUtil } from '@ts-core/backend/database/typeorm';
import { FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common/dto';
import { Logger } from '@ts-core/common/logger';
import { IsOptional, IsString } from 'class-validator';
import { DatabaseService } from '../database/DatabaseService';
import * as _ from 'lodash';
import { ILedgerAction } from '@karma/common/explorer/action';
import { LedgerActionEntity } from '../database/entity/LedgerActionEntity';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class ActionListDto implements Paginable<ILedgerAction> {
    @ApiPropertyOptional()
    conditions?: FilterableConditions<ILedgerAction>;

    @ApiPropertyOptional()
    sort?: FilterableSort<ILedgerAction>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    traceId?: string;
}

export class ActionListDtoResponse implements IPagination<ILedgerAction> {
    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    pageIndex: number;

    @ApiProperty()
    pages: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ isArray: true, type: ILedgerAction })
    items: Array<ILedgerAction>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/actions')
export class ActionListController extends DefaultController<ActionListDto, ActionListDtoResponse> {
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
    @ApiOperation({ summary: `Actions list` })
    @ApiOkResponse({ type: ActionListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: ActionListDto): Promise<ActionListDtoResponse> {
        if (_.isNil(params.conditions)) {
            params.conditions = {};
        }

        let query = this.database.ledgerAction.createQueryBuilder('item');
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (value: LedgerActionEntity): Promise<ILedgerAction> => {
        return value.toObject();
    };
}
