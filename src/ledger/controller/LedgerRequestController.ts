import { Controller, Post, Body } from '@nestjs/common';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import { IsObject, IsNumber, IsBoolean } from 'class-validator';
import * as _ from 'lodash';
import { ITransportFabricCommandOptions, ITransportCommandFabric } from '@ts-core/blockchain-fabric/transport';
import { TransformUtil } from '@ts-core/common/util';
import { TransportCommandFabricAsync, TransportCommandFabric } from '@ts-core/blockchain-fabric/transport/command';
import { ApiProperty } from '@nestjs/swagger';
import { LedgerTransportFactory } from '../service/LedgerTransportFactory';
import { ILedgerRequestRequest } from '@hlf-explorer/common/api';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class RequestDto<U = any> implements ILedgerRequestRequest<U> {
    @ApiProperty()
    @IsObject()
    request: ITransportCommandFabric<U>;

    @ApiProperty()
    @IsObject()
    options: ITransportFabricCommandOptions;

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
    public async execute(@Body() params: RequestDto): Promise<any> {
        let transport = await this.transport.get(params.ledgerId);
        if (params.isAsync) {
            return transport.sendListen(TransformUtil.toClass(TransportCommandFabricAsync, params.request), params.options);
        } else {
            transport.send(TransformUtil.toClass(TransportCommandFabric, params.request), params.options);
        }
    }
}
