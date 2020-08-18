import { Controller, Post, Body } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsObject, IsNumber, IsBoolean } from 'class-validator';
import * as _ from 'lodash';
import { ApiProperty } from '@nestjs/swagger';
import { LedgerTransportFactory } from '../service/LedgerTransportFactory';
import { ILedgerRequestRequest } from '@hlf-explorer/common/api';
import {
    ITransportCommand,
    ITransportCommandOptions,
    ITransportCommandAsync,
    TransportCommandAsync,
    TransportCommand,
} from '@ts-core/common/transport';
import { TransformUtil } from '@ts-core/common/util';
import { TransportFabricCommandOptions } from '@ts-core/blockchain-fabric/transport';

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
    @IsObject()
    options: ITransportCommandOptions;

    @ApiProperty()
    @IsBoolean()
    isAsync: boolean;

    @ApiProperty()
    @IsNumber()
    ledgerId: number;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/ledger/request')
export class LedgerRequestController extends DefaultController<RequestDto, any> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: LedgerTransportFactory) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Post()
    public async execute<U, V>(@Body() params: RequestDto<U>): Promise<any> {
        let transport = await this.transport.get(params.ledgerId);
        if (params.isAsync) {
            return transport.sendListen(TransformUtil.toClass(TransportCommandAsync, params.request), params.options);
        } else {
            transport.send(TransformUtil.toClass(TransportCommand, params.request), params.options);
        }
    }
}
