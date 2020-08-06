import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { TransformUtil } from '@ts-core/common/util';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { ProjectUserAddDto, IProjectUserAddDto } from './ProjectUserAddCommand';

export class ProjectUserEditCommand extends TransportCommandFabricAsync<IProjectUserAddDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.PROJECT_USER_EDIT;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IProjectUserAddDto) {
        super(ProjectUserEditCommand.NAME, TransformUtil.toClass(ProjectUserAddDto, request));
    }
}
