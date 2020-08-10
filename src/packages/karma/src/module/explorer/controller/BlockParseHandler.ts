import { Injectable } from '@nestjs/common';
import { Logger } from '@ts-core/common/logger';
import { Transport, TransportCommandHandler } from '@ts-core/common/transport';
import * as _ from 'lodash';
import { BlockParseCommand, IBlockParseDto } from '../transport/command/BlockParseCommand';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { DatabaseService } from '../../database/DatabaseService';
import { ActionParser } from '../service/ActionParser';
import { LedgerBlockEntity } from '../../database/entity/LedgerBlockEntity';
import { LedgerInfoEntity } from '../../database/entity/LedgerInfoEntity';
import { ExtendedError } from '@ts-core/common/error';

@Injectable()
export class BlockParseHandler extends TransportCommandHandler<IBlockParseDto, BlockParseCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private database: DatabaseService, private api: LedgerApi) {
        super(logger, transport, BlockParseCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: IBlockParseDto): Promise<void> {
        this.log(`Parsing block #${params.number}...`);

        let block = await this.api.getBlock(params.number);
        try {
            await this.database.getConnection().transaction(async manager => {
                let parser = new ActionParser(this.logger);
                let items = _.flatten(await Promise.all(block.transactions.map(item => parser.parse(item))));
                if (!_.isEmpty(items)) {
                    await manager.save(items);
                }

                await manager.save(new LedgerBlockEntity(block));
                await this.database.ledgerUpdate({ id: params.ledgerId, blockHeightParsed: block.number }, manager);
            });
        } catch (error) {
            throw new ExtendedError(`Unable to parse block ${block.number}: ${error.message}`);
        }
    }
}
