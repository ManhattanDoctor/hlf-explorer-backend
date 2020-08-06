import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class UserAddedEvent extends TransportEvent<IUserAddedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.USER_ADDED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IUserAddedDto) {
        super(UserAddedEvent.NAME, TransformUtil.toClass(UserAddedDto, data));
    }
}

export interface IUserAddedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class UserAddedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    uid: string;
}
