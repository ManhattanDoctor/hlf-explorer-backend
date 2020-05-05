import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined, IsEnum } from 'class-validator';
import { LedgerBlock, LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { ILedgerSearchRequest, ILedgerSearchResponse } from '@hlf-explorer/common/api/ledger';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';
import { ServerResponse } from 'http';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerSearchRequest implements ILedgerSearchRequest {
    @ApiProperty()
    @IsDefined()
    query: any;
}

export class LedgerSearchResponse implements ILedgerSearchResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlock | LedgerBlockTransaction;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/search')
export class LedgerSearchController extends DefaultController<LedgerSearchRequest, LedgerSearchResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Search ledger block or transaction` })
    @ApiNotFoundResponse({ description: `Not found` })
    @ApiBadRequestResponse({ description: `Bad request` })
    @ApiOkResponse({ type: LedgerBlock })
    public async executeExtended(@Query() params: LedgerSearchRequest, @Res() response): Promise<LedgerSearchResponse> {
        if (_.isNil(params.query)) {
            throw new ExtendedError(`Query is nil`, HttpStatus.BAD_REQUEST);
        }
        let url = !_.isNaN(Number(params.query)) ? `block?numberOrHash=${params.query}` : `transaction?hashOrUid=${params.query}`;
        return response.redirect(url);
    }
}
