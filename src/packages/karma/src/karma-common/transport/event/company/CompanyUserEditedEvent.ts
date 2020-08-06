import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { LedgerUser } from '../../../ledger/user';

export class CompanyUserEditedEvent extends TransportEvent<ICompanyUserEditedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COMPANY_USER_EDITED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICompanyUserEditedDto) {
        super(CompanyUserEditedEvent.NAME, TransformUtil.toClass(CompanyUserEditedDto, data));
    }
}

export interface ICompanyUserEditedDto extends IKarmaLedgerEventDto {
    userUid: string;
    companyUid: string;
}

class CompanyUserEditedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerCompany.UID_REGXP)
    companyUid: string;
}
