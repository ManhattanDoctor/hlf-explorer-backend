import { Controller, Get, Query } from '@nestjs/common';
import { ApiProperty, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs';
import { Logger } from '@ts-core/common';
import { IsDefined, IsNumber } from 'class-validator';
import { BLOCK_LAST_URL, ILedgerBlockLastGetRequest, ILedgerBlockLastGetResponse, LedgerBlock } from '@hlf-explorer/common';
import { ExtendedError } from '@ts-core/common';
import { LedgerApiMonitor } from '../service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockLastGetRequest implements ILedgerBlockLastGetRequest {
    @ApiProperty()
    @IsDefined()
    public nameOrId: number | string;
}

export class LedgerBlockLastGetResponse implements ILedgerBlockLastGetResponse {
    @ApiProperty()
    @IsNumber()
    public value: LedgerBlock;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller(BLOCK_LAST_URL)
export class LedgerBlockLastGetController extends DefaultController<LedgerBlockLastGetRequest, LedgerBlockLastGetResponse> {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private monitor: LedgerApiMonitor) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Get last ledger block number by name or id` })
    @ApiOkResponse({ type: LedgerBlockLastGetResponse })
    public async executeExtended(@Query() params: LedgerBlockLastGetRequest): Promise<LedgerBlockLastGetResponse> {
        let value = this.monitor.getInfo(params.nameOrId);
        if (_.isNil(value)) {
            throw new ExtendedError(`Unable to find ledger "${params.nameOrId}"`);
        }
        return { value: value.blockLast };
    }
}
