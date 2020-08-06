import { TransportCommand } from '@ts-core/common/transport';

export class BlockParseCommand extends TransportCommand<number> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'BlockParseCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(number: number) {
        super(BlockParseCommand.NAME, number);
    }
}
