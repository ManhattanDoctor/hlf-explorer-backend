import { Logger, LoggerWrapper } from '@ts-core/common/logger';
import { TransportFabricSender } from '@hlf-core/transport/client';
import * as _ from 'lodash';
import { LedgerSettings } from './LedgerSettings';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LedgerTransportFactory extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected items: Map<number, TransportFabricSender>;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private settings: LedgerSettings) {
        super(logger);
        this.items = new Map();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async get(ledgerId: number): Promise<TransportFabricSender> {
        let item = this.items.get(ledgerId);
        if (!_.isNil(item)) {
            return item;
        }

        item = new TransportFabricSender(this.logger, this.settings.getById(ledgerId));
        this.items.set(ledgerId, item);
        await item.connect();
        return item;
    }
}
