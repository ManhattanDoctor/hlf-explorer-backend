import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { TraceUtil } from '@ts-core/common/trace';
import { Transport, TransportCommandHandler } from '@ts-core/common/transport';
import { StateCheckCommand } from '../transport/command/StateCheckCommand';
import { DatabaseService } from '../database/DatabaseService';
import { ExtendedError } from '@ts-core/common/error';
import * as _ from 'lodash';
import { ExplorerService } from '../service/ExplorerService';
import { BlockParseCommand } from '../transport/command/BlockParseCommand';

@Injectable()
export class StateCheckHandler extends TransportCommandHandler<void, StateCheckCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private service: ExplorerService) {
        super(logger, transport, StateCheckCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(): Promise<void> {
        let ledger = await this.service.ledgerGet();
        let blockLast = await this.service.getLastBlockHeight();

        if (_.isNaN(blockLast) || blockLast === 0) {
            throw new ExtendedError(`Last block is incorrect`);
        }

        let blockHeight = await ledger.blockHeight;
        if (blockHeight >= blockLast) {
            return;
        }

        this.log(`Check blocks: ${blockLast - blockHeight} = ${blockLast} - ${blockHeight}`);
        await this.database.ledgerUpdate({ id: ledger.id, blockHeight: blockLast });

        for (let number of await this.service.getUnparsedBlocks(blockHeight + 1, blockLast)) {
            this.transport.send(new BlockParseCommand({ ledgerId: ledger.id, number }));
        }
    }

    protected parseBlock(ledgerId: number, number: number): void {}
}
