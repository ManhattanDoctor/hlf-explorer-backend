import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { TransformUtil } from '@ts-core/common/util';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { IProjectListDtoResponse, IProjectListDto } from '../project';
import { LedgerProject } from '../../../ledger/project';

export class CompanyProjectListCommand extends TransportCommandFabricAsync<ICompanyProjectListDto, IProjectListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_PROJECT_LIST;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyProjectListDto) {
        super(CompanyProjectListCommand.NAME, request, null, true);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(response: IProjectListDtoResponse): IProjectListDtoResponse {
        response.items = TransformUtil.toClassMany(LedgerProject, response.items);
        return response;
    }
}

export interface ICompanyProjectListDto extends IProjectListDto {
    companyUid: string;
}
