import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';

export class ProjectEditedEvent extends TransportEvent<IProjectEditedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_EDITED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectEditedDto) {
        super(ProjectEditedEvent.NAME, TransformUtil.toClass(ProjectEditedDto, data));
    }
}

export interface IProjectEditedDto extends IKarmaLedgerEventDto {
    uid: string;
}

class ProjectEditedDto extends KarmaLedgerEventDto {
    @Matches(LedgerProject.UID_REGXP)
    uid: string;
}
