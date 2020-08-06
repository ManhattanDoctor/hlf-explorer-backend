import { IsString, IsOptional, Matches } from 'class-validator';
import { LedgerUser } from '../../ledger/user';

export enum KarmaLedgerEvent {
    USER_ADDED = 'KARMA:UserAdded',
    USER_EDITED = 'KARMA:UserEdited',
    USER_REMOVED = 'KARMA:UserRemoved',
    USER_CRYPTO_KEY_CHANGED = 'KARMA:UserCryptoKeyChanged',

    COMPANY_ADDED = 'KARMA:CompanyAdded',
    COMPANY_EDITED = 'KARMA:CompanyEdited',
    COMPANY_REMOVED = 'KARMA:CompanyRemoved',
    COMPANY_USER_ADDED = 'KARMA:CompanyUserAdded',
    COMPANY_USER_EDITED = 'KARMA:CompanyUserEdited',
    COMPANY_USER_REMOVED = 'KARMA:CompanyUserRemoved',

    COIN_EMITTED = 'KARMA:CoinEmitted',
    COIN_BURNED = 'KARMA:CoinBurned',
    COIN_TRANSFERED = 'KARMA:CoinTransfered',

    PROJECT_ADDED = 'KARMA:ProjectAdded',
    PROJECT_EDITED = 'KARMA:ProjectEdited',
    PROJECT_REMOVED = 'KARMA:ProjectRemoved',
    PROJECT_USER_ADDED = 'KARMA:ProjectUserAdded',
    PROJECT_USER_EDITED = 'KARMA:ProjectUserEdited',
    PROJECT_USER_REMOVED = 'KARMA:ProjectUserRemoved'
}

export interface IKarmaLedgerEventDto {
    initiator: string;
}

export class KarmaLedgerEventDto implements IKarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    initiator: string;
}
