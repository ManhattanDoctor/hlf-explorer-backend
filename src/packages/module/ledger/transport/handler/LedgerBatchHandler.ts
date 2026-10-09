import { Injectable } from '@nestjs/common';
import { ITransportCryptoManager, TransportCryptoManagerEd25519, Logger, Transport, TransportCommandAsync, TransportCommandHandler } from '@ts-core/common';
import { ILedgerBatchDto, LedgerBatchCommand } from '../LedgerBatchCommand';
import { LedgerSettingsFactory, LedgerTransportFactory } from '../../service';
import { TRANSPORT_FABRIC_COMMAND_BATCH_NAME } from '@hlf-core/transport-common';
import * as _ from 'lodash';

@Injectable()
export class LedgerBatchHandler extends TransportCommandHandler<ILedgerBatchDto, LedgerBatchCommand> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private manager: ITransportCryptoManager;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(
        logger: Logger,
        transport: Transport,
        private factory: LedgerTransportFactory,
        private settings: LedgerSettingsFactory
    ) {
        super(logger, transport, LedgerBatchCommand.NAME);
        this.manager = new TransportCryptoManagerEd25519();
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILedgerBatchDto): Promise<void> {
        let settings = this.settings.getById(params.ledgerId);

        let api = await this.factory.get(params.ledgerId);
        let command = new TransportCommandAsync(TRANSPORT_FABRIC_COMMAND_BATCH_NAME);
        let signature = await TransportCryptoManagerEd25519.sign(command, this.manager, settings.batch.key);
        api.send(command, { signature });
    }
}
