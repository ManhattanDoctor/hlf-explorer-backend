import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { LedgerUser } from '../../../ledger/user';

export class CompanyUserAddedEvent extends TransportEvent<ICompanyUserAddedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COMPANY_USER_ADDED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICompanyUserAddedDto) {
        super(CompanyUserAddedEvent.NAME, TransformUtil.toClass(CompanyUserAddedDto, data));
    }
}

export interface ICompanyUserAddedDto extends IKarmaLedgerEventDto {
    userUid: string;
    companyUid: string;
}

class CompanyUserAddedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerCompany.UID_REGXP)
    companyUid: string;
}
