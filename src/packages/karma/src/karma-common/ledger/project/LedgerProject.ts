import { IsEnum, Length, IsDate, Matches, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RegExpUtil } from '../../util';
import { LedgerWallet } from '../wallet';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { IUIDable } from '../../IUIDable';
import { LedgerCompany } from '../company';

export enum LedgerProjectStatus {
    ACTIVE = 'ACTIVE',
    NON_ACTIVE = 'NON_ACTIVE'
}

export class LedgerProject implements IUIDable {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'project';
    public static UID_REGXP = new RegExp(`${LedgerProject.PREFIX}/${RegExpUtil.DATE_TIME}/${RegExpUtil.UUID}$`, 'i');

    private static MAX_CREATED_DATE = new Date(2500, 0);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(createdDate: Date): LedgerProject {
        let item = new LedgerProject();
        item.uid = LedgerProject.createUid(createdDate);
        item.createdDate = createdDate;
        return item;
    }

    public static createUid(createdDate: Date): string {
        let time = LedgerProject.MAX_CREATED_DATE.getTime() - createdDate.getTime();
        return `${LedgerProject.PREFIX}/${_.padStart(time.toString(), 14, '0')}/${uuid.v4()}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Matches(LedgerProject.UID_REGXP)
    uid: string;

    @IsEnum(LedgerProjectStatus)
    status: LedgerProjectStatus;

    @Type(() => Date)
    @IsDate()
    createdDate: Date;

    @IsOptional()
    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description: string;

    @Type(() => LedgerWallet)
    wallet: LedgerWallet;

    @IsOptional()
    @Matches(LedgerCompany.UID_REGXP)
    companyUid: string;
}
