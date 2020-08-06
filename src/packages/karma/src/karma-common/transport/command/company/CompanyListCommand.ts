import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { TransformUtil } from '@ts-core/common/util';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { IPagination } from '@ts-core/blockchain-fabric/chaincode/dto/IPagination';
import { Paginable } from '@ts-core/blockchain-fabric/chaincode/dto/Paginable';
import { ITraceable } from '@ts-core/common/trace';
import { LedgerCompany } from '../../../ledger/company';

export class CompanyListCommand extends TransportCommandFabricAsync<ICompanyListDto, ICompanyListDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COMPANY_LIST;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICompanyListDto) {
        super(CompanyListCommand.NAME, request, null, true);
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

export interface ICompanyListDto extends Paginable<LedgerCompany>, ITraceable {}
export interface ICompanyListDtoResponse extends IPagination<LedgerCompany> {}
