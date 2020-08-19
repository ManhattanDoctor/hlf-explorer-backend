import { Controller, Get, HttpStatus, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty, ApiOkResponse, ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsDefined, IsString } from 'class-validator';
import { LedgerBlock } from '@hlf-explorer/common/ledger';
import { ILedgerBlockGetResponse, ILedgerBlockGetRequest } from '@hlf-explorer/common/api/block';
import * as _ from 'lodash';
import { DatabaseService } from '../../../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerGuard, ILedgerHolder } from '../../service/guard/LedgerGuard';

// --------------------------------------------------------------------------
//
//  Dto
//
// --------------------------------------------------------------------------

export class LedgerBlockGetRequest implements ILedgerBlockGetRequest {
    @ApiProperty()
    @IsDefined()
    hashOrNumber: number | string;

    @ApiProperty()
    @IsString()
    ledgerName: string;
}

export class LedgerBlockGetResponse implements ILedgerBlockGetResponse {
    @ApiProperty()
    @IsDefined()
    value: LedgerBlock;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/block')
export class LedgerBlockGetController extends DefaultController<LedgerBlockGetRequest, LedgerBlockGetResponse> {
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
    @ApiOperation({ summary: `Get ledger block by number or hash` })
    @ApiOkResponse({ type: LedgerBlock })
    @UseGuards(LedgerGuard)
    public async executeExtended(@Query() params: LedgerBlockGetRequest, @Req() holder: ILedgerHolder): Promise<LedgerBlockGetResponse> {
        if (_.isNil(params.hashOrNumber)) {
            throw new ExtendedError(`Block hash or number is nil`, HttpStatus.BAD_REQUEST);
        }
        /*
        let item = await this.cache.wrap<LedgerBlock>(this.getCacheKey(params), () => this.getItem(params), {
            ttl: DateUtil.MILISECONDS_DAY / DateUtil.MILISECONDS_SECOND
        });
        */
        let item = await this.getItem(params, holder.ledger.id);
        if (_.isNil(item)) {
            throw new ExtendedError(`Unable to find block "${params.hashOrNumber}" hash or number`, HttpStatus.NOT_FOUND);
        }

        return { value: item };
    }

    private async getItem(params: ILedgerBlockGetRequest, ledgerId: number): Promise<LedgerBlock> {
        let conditions = { ledgerId } as Partial<LedgerBlock>;
        if (!_.isNaN(Number(params.hashOrNumber))) {
            conditions.number = Number(params.hashOrNumber);
        } else {
            conditions.hash = params.hashOrNumber.toString();
        }
        let item = await this.database.ledgerBlock.findOne(conditions);
        return !_.isNil(item) ? TransformUtil.fromClass(item) : null;
    }
}
