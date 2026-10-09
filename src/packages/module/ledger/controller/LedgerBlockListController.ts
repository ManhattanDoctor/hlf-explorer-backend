import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { LedgerBlock, BLOCKS_URL } from '@hlf-explorer/common';
import { LedgerBlockEntity } from '@project/module/database/block';
import { DatabaseService } from '@project/module/database/service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockListDto implements Paginable<LedgerBlock> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<LedgerBlock>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<LedgerBlock>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

export class LedgerBlockListDtoResponse implements IPagination<LedgerBlock> {
    @ApiProperty()
    public pageSize: number;

    @ApiProperty()
    public pageIndex: number;

    @ApiProperty()
    public pages: number;

    @ApiProperty()
    public total: number;

    @ApiProperty({ isArray: true, type: LedgerBlock })
    public items: Array<LedgerBlock>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Block')
@Controller(BLOCKS_URL)
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
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerBlockListDto): Promise<LedgerBlockListDtoResponse> {
        let ledgerName = params.conditions['ledgerName'];
        delete params.conditions['ledgerName'];

        let query = this.database.ledgerRelationAdd(this.database.ledgerBlock.createQueryBuilder('block'), ledgerName);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: LedgerBlockEntity): Promise<LedgerBlock> => item.toObject();
}
