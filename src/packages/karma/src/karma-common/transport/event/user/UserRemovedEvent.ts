import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class UserRemovedEvent extends TransportEvent<IUserRemovedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.USER_REMOVED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IUserRemovedDto) {
        super(UserRemovedEvent.NAME, TransformUtil.toClass(UserRemovedDto, data));
    }
}

export interface IUserRemovedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class UserRemovedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    uid: string;
}
