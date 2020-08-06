import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { Matches } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerCompany } from '../../../ledger/company';
import { LedgerUser } from '../../../ledger/user';
import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';

export class CompanyUserRemoveCommand extends TransportCommandFabricAsync<ICompanyUserRemoveDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_USER_REMOVE;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyUserRemoveDto) {
        super(CompanyUserRemoveCommand.NAME, TransformUtil.toClass(CompanyUserRemoveDto, request));
    }
}

export interface ICompanyUserRemoveDto extends ITraceable {
    userUid: string;
    companyUid: string;
}

class CompanyUserRemoveDto implements ICompanyUserRemoveDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerCompany.UID_REGXP)
    companyUid: string;
}
