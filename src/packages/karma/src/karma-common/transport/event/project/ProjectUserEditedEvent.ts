import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { LedgerUser } from '../../../ledger/user';

export class ProjectUserEditedEvent extends TransportEvent<IProjectUserEditedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_USER_EDITED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectUserEditedDto) {
        super(ProjectUserEditedEvent.NAME, TransformUtil.toClass(ProjectUserEditedDto, data));
    }
}

export interface IProjectUserEditedDto extends IKarmaLedgerEventDto {
    userUid: string;
    projectUid: string;
}

class ProjectUserEditedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerProject.UID_REGXP)
    projectUid: string;
}
