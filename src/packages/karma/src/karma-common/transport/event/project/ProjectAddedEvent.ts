import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class ProjectAddedEvent extends TransportEvent<IProjectAddedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_ADDED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectAddedDto) {
        super(ProjectAddedEvent.NAME, TransformUtil.toClass(ProjectAddedDto, data));
    }
}

export interface IProjectAddedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class ProjectAddedDto extends KarmaLedgerEventDto {
    @Matches(LedgerProject.UID_REGXP)
    uid: string;
}
