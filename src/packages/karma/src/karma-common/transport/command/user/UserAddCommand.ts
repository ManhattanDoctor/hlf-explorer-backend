import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerUser } from '../../../ledger/user';
import { IsString, IsEnum, Length, ValidateNested, Matches, IsOptional, IsDefined } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerCryptoKeyAlgorithm } from '../../../ledger/cryptoKey';
import { RegExpUtil } from '../../../util';
import { Type } from 'class-transformer';
import { LedgerRole } from '../../../ledger/role';

export class UserAddCommand extends TransportCommandFabricAsync<IUserAddDto, LedgerUser> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.USER_ADD;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserAddDto) {
        super(UserAddCommand.NAME, TransformUtil.toClass(UserAddDto, request));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: LedgerUser): LedgerUser {
        return TransformUtil.toClass(LedgerUser, item);
    }
}

export interface IUserCryptoKey {
    value: string;
    algorithm: LedgerCryptoKeyAlgorithm;
}

export interface IUserAddDto extends ITraceable {
    cryptoKey: IUserCryptoKey;
    
    roles?: Array<LedgerRole>;
    description?: string;
}

// export needs because another command use it
export class UserCryptoKey implements IUserCryptoKey {
    @IsString()
    value: string;

    @IsEnum(LedgerCryptoKeyAlgorithm)
    algorithm: LedgerCryptoKeyAlgorithm;
}

class UserAddDto implements IUserAddDto {
    @Type(() => UserCryptoKey)
    @IsDefined()
    @ValidateNested()
    cryptoKey: UserCryptoKey;

    @IsOptional()
    @IsEnum(LedgerRole, { each: true })
    roles?: Array<LedgerRole>;

    @IsOptional()
    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description?: string;
}
