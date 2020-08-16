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
import { ILedgerCommandRequest } from '@hlf-explorer/common/api';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class CommandDto<U = any> implements ILedgerCommandRequest<U> {
    @ApiProperty()
    @IsObject()
    command: ITransportCommandFabric<U>;

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

@Controller('api/ledger/command')
export class LedgerCommandController extends DefaultController<CommandDto, any> {
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
    public async execute(@Body() params: CommandDto): Promise<any> {
        let transport = await this.transport.get(params.ledgerId);
        if (params.isAsync) {
            return transport.sendListen(TransformUtil.toClass(TransportCommandFabricAsync, params.command), params.options);
        } else {
            transport.send(TransformUtil.toClass(TransportCommandFabric, params.command), params.options);
        }
    }
}
