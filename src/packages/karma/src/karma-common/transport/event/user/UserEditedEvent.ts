import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class UserEditedEvent extends TransportEvent<IUserEditedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.USER_EDITED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IUserEditedDto) {
        super(UserEditedEvent.NAME, TransformUtil.toClass(UserEditedDto, data));
    }
}

export interface IUserEditedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class UserEditedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    uid: string;
}
