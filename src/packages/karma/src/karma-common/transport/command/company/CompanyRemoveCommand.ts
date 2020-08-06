import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';

export class CompanyRemoveCommand extends TransportCommandFabricAsync<ICompanyRemoveDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_REMOVE;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyRemoveDto) {
        super(CompanyRemoveCommand.NAME, TransformUtil.toClass(CompanyRemoveDto, request));
    }
}

export interface ICompanyRemoveDto extends ITraceable {
    uid: string;
}

class CompanyRemoveDto implements ICompanyRemoveDto {
    @Matches(LedgerCompany.UID_REGXP)
    uid: string;
}
