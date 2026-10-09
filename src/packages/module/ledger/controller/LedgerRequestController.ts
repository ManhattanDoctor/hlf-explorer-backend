import { Controller, Post, Body } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs';
import { TransformUtil, Logger, ITransportCommand, ITransportCommandOptions, TransportCommandAsync, TransportCommand, ExtendedError } from '@ts-core/common';
import { IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiOperation, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { LedgerTransportFactory } from '../service/LedgerTransportFactory';
import { ILedgerRequestRequest, REQUEST_URL } from '@hlf-explorer/common';
import { LedgerService } from '../service';
import * as _ from 'lodash';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class RequestDto<U = any> implements ILedgerRequestRequest<U> {
    @ApiProperty()
    @IsObject()
    request: ITransportCommand<U>;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    options?: ITransportCommandOptions;

    @ApiProperty()
    @IsBoolean()
    isAsync: boolean;

    @ApiProperty()
    @IsString()
    ledgerName: string;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@ApiTags('Command')
@Controller(REQUEST_URL)
export class LedgerRequestController extends DefaultController<RequestDto, any> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private factory: LedgerTransportFactory, private service: LedgerService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Post()
    @ApiOperation({
        summary: `Send a command to the chaincode`,
        description: `Forward an arbitrary transport command to the chaincode of the given ledger. With "isAsync" the command is sent via sendListen (the chaincode response is awaited and returned), otherwise via send (fire-and-forget). The command signature is not verified and the caller is not authenticated — keep this endpoint internal.`
    })
    @ApiOkResponse({ description: `Chaincode response when "isAsync" is true; empty otherwise` })
    public async executeExtended<U, V>(@Body() params: RequestDto<U>): Promise<V | void> {
        let item = await this.service.ledgerGet(params.ledgerName);
        if (_.isNil(item)) {
            throw new ExtendedError(`Ledger "${params.ledgerName}" not found`);
        }
        let transport = await this.factory.get(item.id);
        let { request, options } = params;
        return params.isAsync ? transport.sendListen(TransformUtil.toClass(TransportCommandAsync<U, V>, request), options) : transport.send(TransformUtil.toClass(TransportCommand, request), options);
    }
}
