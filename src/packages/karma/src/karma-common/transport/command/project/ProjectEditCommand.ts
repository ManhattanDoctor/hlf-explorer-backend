import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerProject } from '../../../ledger/project';
import { ITraceable } from '@ts-core/common/trace';
import { Length, IsOptional, Matches } from 'class-validator';
import { RegExpUtil } from '../../../util';
import { TransformUtil } from '@ts-core/common/util';

export class ProjectEditCommand extends TransportCommandFabricAsync<IProjectEditDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.PROJECT_EDIT;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IProjectEditDto) {
        super(ProjectEditCommand.NAME, TransformUtil.toClass(ProjectEditDto, request));
    }
}

export interface IProjectEditDto extends ITraceable {
    uid: string;
    description?: string;
}

class ProjectEditDto implements IProjectEditDto {
    @Matches(LedgerProject.UID_REGXP)
    uid: string;

    @Length(0, 50)
    @IsOptional()
    @Matches(RegExpUtil.DESCRIPTION)
    description?: string;
}
