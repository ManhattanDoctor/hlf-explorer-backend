import { TransformUtil } from '@ts-core/common/util';
import { LedgerCompany } from '../../../ledger/company';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class CompanyAddedEvent extends TransportEvent<ICompanyAddedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COMPANY_ADDED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICompanyAddedDto) {
        super(CompanyAddedEvent.NAME, TransformUtil.toClass(CompanyAddedDto, data));
    }
}

export interface ICompanyAddedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class CompanyAddedDto extends KarmaLedgerEventDto {
    @Matches(LedgerCompany.UID_REGXP)
    uid: string;
}
