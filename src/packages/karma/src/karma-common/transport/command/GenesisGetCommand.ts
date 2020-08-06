import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { KarmaLedgerCommand } from './KarmaLedgerCommand';
import { IGenesis } from '../../ledger';
import { LedgerUser } from '../../ledger/user';
import { TransformUtil } from '@ts-core/common/util';
import { IsDate, Matches, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class GenesisGetCommand extends TransportCommandFabricAsync<void, IGenesis> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.GENESIS_GET;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super(GenesisGetCommand.NAME, null, null, false);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: IGenesis): IGenesis {
        return TransformUtil.toClass(Genesis, item);
    }
}

class Genesis implements IGenesis {
    @Matches(LedgerUser.UID_REGXP)
    rootUserUid: string;

    @Type(() => Date)
    @IsDate()
    createdDate: Date;
}
