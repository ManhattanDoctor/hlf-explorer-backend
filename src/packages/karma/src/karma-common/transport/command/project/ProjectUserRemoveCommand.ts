import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { Matches } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerProject } from '../../../ledger/project';
import { LedgerUser } from '../../../ledger/user';
import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';

export class ProjectUserRemoveCommand extends TransportCommandFabricAsync<IProjectUserRemoveDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.PROJECT_USER_REMOVE;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IProjectUserRemoveDto) {
        super(ProjectUserRemoveCommand.NAME, TransformUtil.toClass(ProjectUserRemoveDto, request));
    }
}

export interface IProjectUserRemoveDto extends ITraceable {
    userUid: string;
    projectUid: string;
}

class ProjectUserRemoveDto implements IProjectUserRemoveDto {
    @Matches(LedgerUser.UID_REGXP)
    userUid: string;

    @Matches(LedgerProject.UID_REGXP)
    projectUid: string;
}
