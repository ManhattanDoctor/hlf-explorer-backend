import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { Matches, Length } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerCompany } from '../../../ledger/company';
import { RegExpUtil } from '../../../util';
import { LedgerUser } from '../../../ledger/user';

export class CompanyAddCommand extends TransportCommandFabricAsync<ICompanyAddDto, LedgerCompany> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_ADD;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyAddDto) {
        super(CompanyAddCommand.NAME, TransformUtil.toClass(CompanyAddDto, request));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: LedgerCompany): LedgerCompany {
        return TransformUtil.toClass(LedgerCompany, item);
    }
}

export interface ICompanyAddDto extends ITraceable {
    ownerUid: string;
    description: string;
}

class CompanyAddDto implements ICompanyAddDto {
    @Matches(LedgerUser.UID_REGXP)
    ownerUid: string;

    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description: string;
}
