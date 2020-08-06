import { IsEnum, IsString } from 'class-validator';
import { IUIDable } from '../../IUIDable';

export enum LedgerCryptoKeyAlgorithm {
    ED25519 = 'Ed25519'
}

export class LedgerCryptoKey implements IUIDable {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'cryptoKey';

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    uid: string;

    @IsString()
    value: string;

    @IsEnum(LedgerCryptoKeyAlgorithm)
    algorithm: LedgerCryptoKeyAlgorithm;
}
