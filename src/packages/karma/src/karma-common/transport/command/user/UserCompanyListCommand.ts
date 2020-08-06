import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { TransformUtil } from '@ts-core/common/util';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { ICompanyListDto, ICompanyListDtoResponse } from '../company';
import { LedgerCompany } from '../../../ledger/company';

export class UserCompanyListCommand extends TransportCommandFabricAsync<IUserCompanyListDto, ICompanyListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.USER_COMPANY_LIST;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IUserCompanyListDto) {
        super(UserCompanyListCommand.NAME, request, null, true);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(response: ICompanyListDtoResponse): ICompanyListDtoResponse {
        response.items = TransformUtil.toClassMany(LedgerCompany, response.items);
        return response;
    }
}

export interface IUserCompanyListDto extends ICompanyListDto {
    userUid: string;
}
