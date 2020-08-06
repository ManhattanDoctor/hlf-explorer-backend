import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class CompanyEditedEvent extends TransportEvent<ICompanyEditedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COMPANY_EDITED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICompanyEditedDto) {
        super(CompanyEditedEvent.NAME, TransformUtil.toClass(CompanyEditedDto, data));
    }
}

export interface ICompanyEditedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class CompanyEditedDto extends KarmaLedgerEventDto {
    @Matches(LedgerCompany.UID_REGXP)
    uid: string;
}
