import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { TransformUtil } from '@ts-core/common/util';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { CompanyUserAddDto, ICompanyUserAddDto } from './CompanyUserAddCommand';

export class CompanyUserEditCommand extends TransportCommandFabricAsync<ICompanyUserAddDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_USER_EDIT;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyUserAddDto) {
        super(CompanyUserEditCommand.NAME, TransformUtil.toClass(CompanyUserAddDto, request));
    }
}
