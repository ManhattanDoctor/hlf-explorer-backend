import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerProject } from '../../../ledger/project';
import { Length, Matches } from 'class-validator';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { RegExpUtil } from '../../../util';
import { LedgerCompany } from '../../../ledger/company';
import { LedgerUser } from '../../../ledger/user';

export class ProjectAddCommand extends TransportCommandFabricAsync<IProjectAddDto, LedgerProject> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.PROJECT_ADD;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IProjectAddDto) {
        super(ProjectAddCommand.NAME, TransformUtil.toClass(ProjectAddDto, request));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected checkResponse(item: LedgerProject): LedgerProject {
        return TransformUtil.toClass(LedgerProject, item);
    }
}


export interface IProjectAddDto extends ITraceable {
    ownerUid: string;
    companyUid: string;
    description: string;
}

class ProjectAddDto implements IProjectAddDto {
    @Matches(LedgerUser.UID_REGXP)
    ownerUid: string;

    @Matches(LedgerCompany.UID_REGXP)
    companyUid: string;

    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description: string;
}
