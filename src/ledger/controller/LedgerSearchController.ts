import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined, IsNumberString, IsEnum } from 'class-validator';
import { LedgerBlock, LedgerBlockTransaction, LedgerBlockEvent } from '@hlf-explorer/common/ledger';
import { ILedgerSearchRequest, ILedgerSearchResponse } from '@hlf-explorer/common/api';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';
import { Validator } from 'class-validator';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerSearchRequest implements ILedgerSearchRequest {
    @ApiProperty()
    @IsDefined()
    query: any;

    @ApiProperty()
    @IsNumberString()
    ledgerId: number;
}

export class LedgerSearchResponse implements ILedgerSearchResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlock | LedgerBlockTransaction | LedgerBlockEvent;
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
    //  Properties
    //
    // --------------------------------------------------------------------------

    private validator: Validator;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger) {
        super(logger);
        this.validator = new Validator();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Search ledger block, transaction or event` })
    @ApiNotFoundResponse({ description: `Not found` })
    @ApiBadRequestResponse({ description: `Bad request` })
    @ApiOkResponse({ type: LedgerBlock })
    public async executeExtended(@Query() params: LedgerSearchRequest, @Res() response): Promise<LedgerSearchResponse> {
        let value = _.trim(params.query);
        if (_.isNil(value)) {
            throw new ExtendedError(`Query is nil`, HttpStatus.BAD_REQUEST);
        }
        let url = null;
        if (this.validator.isUUID(value)) {
            url = `event?uid=${value}`;
        } else if (!_.isNaN(Number(value))) {
            url = `block?hashOrNumber=${value}`;
        } else {
            url = `transaction?hashOrUid=${value}`;
        }
        url = `${url}&ledgerId=${params.ledgerId}`;
        return response.redirect(url);
    }
}