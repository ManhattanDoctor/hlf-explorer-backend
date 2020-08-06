import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Length, IsOptional, Matches } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { RegExpUtil } from '../../../util';

export class CompanyEditCommand extends TransportCommandFabricAsync<ICompanyEditDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_EDIT;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyEditDto) {
        super(CompanyEditCommand.NAME, TransformUtil.toClass(CompanyEditDto, request));
    }
}

export interface ICompanyEditDto extends ITraceable {
    uid: string;
    description?: string;
}

class CompanyEditDto implements ICompanyEditDto {
    @Matches(LedgerCompany.UID_REGXP)
    uid: string;

    @IsOptional()
    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description?: string;
}
