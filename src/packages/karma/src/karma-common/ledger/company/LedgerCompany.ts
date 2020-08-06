import { IsEnum, Length, IsDate, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RegExpUtil } from '../../util';
import { LedgerWallet } from '../wallet';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { IUIDable } from '../../IUIDable';

export enum LedgerCompanyStatus {
    ACTIVE = 'ACTIVE',
    NON_ACTIVE = 'NON_ACTIVE'
}

export class LedgerCompany implements IUIDable {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'company';
    public static UID_REGXP = new RegExp(`${LedgerCompany.PREFIX}/${RegExpUtil.DATE_TIME}/${RegExpUtil.UUID}$`, 'i');

    private static MAX_CREATED_DATE = new Date(2500, 0);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(createdDate: Date): LedgerCompany {
        let item = new LedgerCompany();
        item.uid = LedgerCompany.createUid(createdDate);
        item.createdDate = createdDate;
        return item;
    }

    public static createUid(createdDate: Date): string {
        let time = LedgerCompany.MAX_CREATED_DATE.getTime() - createdDate.getTime();
        return `${LedgerCompany.PREFIX}/${_.padStart(time.toString(), 14, '0')}/${uuid.v4()}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Matches(LedgerCompany.UID_REGXP)
    uid: string;

    @IsEnum(LedgerCompanyStatus)
    status: LedgerCompanyStatus;

    @Type(() => Date)
    @IsDate()
    createdDate: Date;

    @IsOptional()
    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description?: string;

    @IsOptional()
    @Type(() => LedgerWallet)
    wallet: LedgerWallet;
}
