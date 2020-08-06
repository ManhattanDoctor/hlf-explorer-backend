import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class CompanyRemovedEvent extends TransportEvent<ICompanyRemovedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COMPANY_REMOVED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICompanyRemovedDto) {
        super(CompanyRemovedEvent.NAME, TransformUtil.toClass(CompanyRemovedDto, data));
    }
}

export interface ICompanyRemovedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class CompanyRemovedDto extends KarmaLedgerEventDto {
    @Matches(LedgerCompany.UID_REGXP)
    uid: string;
}
