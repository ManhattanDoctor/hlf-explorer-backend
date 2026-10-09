import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, IPagination, Paginable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { TRANSACTIONS_URL, LedgerBlockTransaction } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import { LedgerBlockTransactionEntity } from '@project/module/database/block';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerBlockTransactionListDto implements Paginable<LedgerBlockTransaction> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<LedgerBlockTransaction>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<LedgerBlockTransaction>;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_SIZE })
    public pageSize: number;

    @ApiPropertyOptional({ default: Paginable.DEFAULT_PAGE_INDEX })
    public pageIndex: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

export class LedgerBlockTransactionListDtoResponse implements IPagination<LedgerBlockTransaction> {
    @ApiProperty()
    public pageSize: number;

    @ApiProperty()
    public pageIndex: number;

    @ApiProperty()
    public pages: number;

    @ApiProperty()
    public total: number;

    @ApiProperty({ isArray: true, type: LedgerBlockTransaction })
    public items: Array<LedgerBlockTransaction>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Transaction')
@Controller(TRANSACTIONS_URL)
export class LedgerBlockTransactionListController extends DefaultController<
    LedgerBlockTransactionListDto,
    LedgerBlockTransactionListDtoResponse
> {
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
    @ApiOperation({ summary: `Ledger transactions list` })
    @ApiOkResponse({ type: LedgerBlockTransactionListDtoResponse })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerBlockTransactionListDto): Promise<LedgerBlockTransactionListDtoResponse> {
        let ledgerName = params.conditions['ledgerName'];
        delete params.conditions['ledgerName'];

        let query = this.database.ledgerRelationAdd(this.database.ledgerBlockTransaction.createQueryBuilder('transaction'), ledgerName);
        return TypeormUtil.toPagination(query, params, this.transform);
    }

    protected transform = async (item: LedgerBlockTransactionEntity): Promise<LedgerBlockTransaction> => item.toObject();
}
