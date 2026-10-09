import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TypeormUtil } from '@ts-core/backend';
import { Logger, FilterableConditions, FilterableSort, Paginable, IFilterable } from '@ts-core/common';
import { IsOptional, IsString } from 'class-validator';
import { LEDGERS_URL, Ledger } from '@hlf-explorer/common';
import { DatabaseService } from '@project/module/database/service';
import { LedgerEntity } from '@project/module/database/ledger';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class LedgerListDto implements IFilterable<Ledger> {
    @ApiPropertyOptional()
    public conditions?: FilterableConditions<Ledger>;

    @ApiPropertyOptional()
    public sort?: FilterableSort<Ledger>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    public traceId?: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Ledger')
@Controller(LEDGERS_URL)
export class LedgerListController extends DefaultController<LedgerListDto, Array<Ledger>> {
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
    @ApiOperation({ summary: `Ledger list`, description: `List of registered Fabric networks and their parsing state.` })
    @ApiOkResponse({ type: Ledger, isArray: true })
    public async executeExtended(@Query({ transform: Paginable.transform }) params: LedgerListDto): Promise<Array<Ledger>> {
        let query = this.database.ledger.createQueryBuilder('ledger');
        return TypeormUtil.toFilterable(query, params, this.transform);
    }

    protected transform = async (item: LedgerEntity): Promise<Ledger> => item.toObject();
}
