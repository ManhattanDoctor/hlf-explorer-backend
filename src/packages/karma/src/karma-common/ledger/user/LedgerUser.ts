import { IsEnum, IsOptional, IsDate, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { LedgerCryptoKey } from '../cryptoKey';
import { RegExpUtil } from '../../util';
import { IUIDable } from '../../IUIDable';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import { LedgerRole } from '../role';

export enum LedgerUserStatus {
    ACTIVE = 'ACTIVE',
    NON_ACTIVE = 'NON_ACTIVE'
}

export class LedgerUser implements IUIDable {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'user';
    public static UID_REGXP = new RegExp(`${LedgerUser.PREFIX}/${RegExpUtil.DATE_TIME}/${RegExpUtil.UUID}$`, 'i');

    private static MAX_CREATED_DATE = new Date(2500, 0);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create(createdDate: Date, isDefaultRootUser?: boolean): LedgerUser {
        let item = new LedgerUser();
        item.uid = LedgerUser.createUid(createdDate, isDefaultRootUser);
        item.createdDate = createdDate;
        return item;
    }

    public static createUid(createdDate: Date, isDefaultRootUser?: boolean): string {
        let uid = !isDefaultRootUser ? uuid.v4() : '00000000-0000-0000-0000-000000000000';
        let time = !isDefaultRootUser ? LedgerUser.MAX_CREATED_DATE.getTime() - createdDate.getTime() : 0;
        return `${LedgerUser.PREFIX}/${_.padStart(time.toString(), 14, '0')}/${uid}`;
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Matches(LedgerUser.UID_REGXP)
    uid: string;

    @IsEnum(LedgerUserStatus)
    status: LedgerUserStatus;

    @Type(() => Date)
    @IsDate()
    createdDate: Date;

    @IsOptional()
    @Length(0, 50)
    @Matches(RegExpUtil.DESCRIPTION)
    description?: string;

    @IsOptional()
    @Type(() => LedgerCryptoKey)
    cryptoKey?: LedgerCryptoKey;

    @IsOptional()
    @IsEnum(LedgerRole, { each: true })
    roles?: Array<LedgerRole>;
}
