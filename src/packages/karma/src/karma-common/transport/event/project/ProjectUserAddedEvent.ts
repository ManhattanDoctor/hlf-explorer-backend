import { TransformUtil } from '@ts-core/common/util';
import { LedgerProject } from '../../../ledger/project';
import { Matches } from 'class-validator';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { LedgerUser } from '../../../ledger/user';

export class ProjectUserAddedEvent extends TransportEvent<IProjectUserAddedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.PROJECT_USER_ADDED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IProjectUserAddedDto) {
        super(ProjectUserAddedEvent.NAME, TransformUtil.toClass(ProjectUserAddedDto, data));
    }
}

export interface IProjectUserAddedDto extends IKarmaLedgerEventDto {
    userUid: string;
    projectUid: string;
}

class ProjectUserAddedDto extends KarmaLedgerEventDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerProject.UID_REGXP)
    projectUid: string;
}
