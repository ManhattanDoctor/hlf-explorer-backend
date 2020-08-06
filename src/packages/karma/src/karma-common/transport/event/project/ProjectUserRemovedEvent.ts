import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { LedgerUser } from '../../../ledger/user';

export class ProjectUserRemovedEvent extends TransportEvent<IProjectUserRemovedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_USER_REMOVED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectUserRemovedDto) {
        super(ProjectUserRemovedEvent.NAME, TransformUtil.toClass(ProjectUserRemovedDto, data));
    }
}

export interface IProjectUserRemovedDto extends IKarmaLedgerEventDto {
    userUid: string;
    projectUid: string;
}

class ProjectUserRemovedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerProject.UID_REGXP)
    projectUid: string;
}
