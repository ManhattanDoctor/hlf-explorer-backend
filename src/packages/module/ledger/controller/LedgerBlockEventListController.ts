import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { FilterableConditions, Logger, FilterableSort, IPagination, Paginable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { LedgerBlockEvent, EVENTS_URL } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import { LedgerBlockEventEntity } from '@project/module/database/block';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockEventListDto implements Paginable<LedgerBlockEvent> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<LedgerBlockEvent>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<LedgerBlockEvent>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

export class LedgerBlockEventListDtoResponse implements IPagination<LedgerBlockEvent> {
    @ApiProperty()
    public pageSize: number;

    @ApiProperty()
    public pageIndex: number;

    @ApiProperty()
    public pages: number;

    @ApiProperty()
    public total: number;

    @ApiProperty({ isArray: true, type: LedgerBlockEvent })
    public items: Array<LedgerBlockEvent>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Event')
@Controller(EVENTS_URL)
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
    @ApiOkResponse({ type: LedgerBlockEventListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerBlockEventListDto): Promise<LedgerBlockEventListDtoResponse> {
        let ledgerName = params.conditions['ledgerName'];
        delete params.conditions['ledgerName'];

        let query = this.database.ledgerRelationAdd(this.database.ledgerBlockEvent.createQueryBuilder('event'), ledgerName);
        params.sort = { ...params.sort, id: true };
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: LedgerBlockEventEntity): Promise<LedgerBlockEvent> => item.toObject();

}
