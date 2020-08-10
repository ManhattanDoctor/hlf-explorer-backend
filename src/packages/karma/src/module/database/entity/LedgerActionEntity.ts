import { Exclude, Type } from 'class-transformer';
import { IsDate, Matches, IsBoolean, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Column, Index, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LedgerActionType, ILedgerAction } from '@karma/common/explorer/action';
import { LedgerUser } from '@karma/common/ledger/user';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { FabricTransactionValidationCode } from '@ts-core/blockchain-fabric/api';
import * as _ from 'lodash';
import { Sha512 } from '@ts-core/common/crypto/hash';

@Entity()
@Index(['uid'], { unique: true })
@Index(['type', 'subjectUid'])
export class LedgerActionEntity implements ILedgerAction {
    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static createUid(commandUid: string, item: ILedgerAction): string {
        return Sha512.hex(`${commandUid}${item.transactionUid}${item.subjectUid}${item.type}`);
    }

    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @Exclude()
    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @IsString()
    public uid: string;

    @Column()
    @IsDate()
    @Type(() => Date)
    public date: Date;

    @Column()
    @IsString()
    public type: LedgerActionType;

    @Column({ name: 'subject_uid' })
    @IsString()
    subjectUid: string;

    @Column({ name: 'transaction_uid' })
    @IsString()
    transactionUid: string;

    @Column({ name: 'initiator_uid', nullable: true })
    @Matches(LedgerUser.UID_REGXP)
    @IsOptional()
    initiatorUid?: string;

    @Column({ name: 'is_succeed' })
    @IsBoolean()
    isSucceed: boolean;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(item?: LedgerBlockTransaction, type?: LedgerActionType, subjectUid?: string) {
        if (!_.isNil(item)) {
            this.date = item.createdDate;
            this.isSucceed = item.validationCode === FabricTransactionValidationCode.VALID;
            this.initiatorUid = item.requestUserId;
            this.transactionUid = item.hash;
        }
        if (!_.isNil(type)) {
            this.type = type;
        }
        if (!_.isNil(subjectUid)) {
            this.subjectUid = subjectUid;
        }
    }
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(): ILedgerAction {
        return TransformUtil.fromClass(this, { excludePrefixes: ['__'] });
    }
}
