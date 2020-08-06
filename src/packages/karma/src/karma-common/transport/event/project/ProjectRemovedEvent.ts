import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class ProjectRemovedEvent extends TransportEvent<IProjectRemovedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_REMOVED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectRemovedDto) {
        super(ProjectRemovedEvent.NAME, TransformUtil.toClass(ProjectRemovedDto, data));
    }
}

export interface IProjectRemovedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class ProjectRemovedDto extends KarmaLedgerEventDto {
    @Matches(LedgerProject.UID_REGXP)
    uid: string;
}
