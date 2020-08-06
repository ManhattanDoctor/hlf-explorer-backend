import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class UserCryptoKeyChangedEvent extends TransportEvent<IUserCryptoKeyChangedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.USER_CRYPTO_KEY_CHANGED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IUserCryptoKeyChangedDto) {
        super(UserCryptoKeyChangedEvent.NAME, TransformUtil.toClass(UserCryptoKeyChangedDto, data));
    }
}

export interface IUserCryptoKeyChangedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class UserCryptoKeyChangedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    uid: string;
}
