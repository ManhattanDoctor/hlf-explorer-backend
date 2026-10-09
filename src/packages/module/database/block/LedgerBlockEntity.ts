import { LedgerBlock } from '@hlf-explorer/common';
import { ObjectUtil, TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, ClassTransformOptions, Type } from 'class-transformer';
import { IsDate, ValidateNested, IsNumber, IsDefined, IsOptional, IsString } from 'class-validator';
import { OneToOne, OneToMany, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LedgerBlockRawEntity } from './LedgerBlockRawEntity';
import { LedgerBlockEventEntity } from './LedgerBlockEventEntity';
import { LedgerBlockTransactionEntity } from './LedgerBlockTransactionEntity';
import { IFabricBlock } from '@hlf-core/api';
import { LedgerEntity } from '../ledger';

@Entity('ledger_block')
export class LedgerBlockEntity extends TypeormValidableEntity implements LedgerBlock {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column()
    @IsString()
    public hash: string;

    @Column()
    @IsDate()
    @Type(() => Date)
    public date: Date;

    @Column()
    @IsNumber()
    public number: number;

    @OneToMany(() => LedgerBlockTransactionEntity, item => item.block, { cascade: true })
    @Type(() => LedgerBlockTransactionEntity)
    @ValidateNested()
    public transactions: Array<LedgerBlockTransactionEntity>;

    @Column({ name: 'transactions_count' })
    @IsNumber()
    public transactionsCount: number;

    @OneToMany(() => LedgerBlockEventEntity, item => item.block, { cascade: true })
    @Type(() => LedgerBlockEventEntity)
    @ValidateNested()
    public events: Array<LedgerBlockEventEntity>;

    @Column({ name: 'events_count' })
    @IsNumber()
    public eventsCount: number;

    @Exclude()
    public rawData: IFabricBlock;

    @Exclude()
    @OneToOne(() => LedgerBlockRawEntity, item => item.block, { cascade: true })
    @IsDefined()
    @ValidateNested()
    public data: LedgerBlockRawEntity;

    @Exclude()
    @Column({ name: 'ledger_id' })
    @IsNumber()
    public ledgerId: number;

    @Exclude()
    @ManyToOne(() => LedgerEntity, item => item.blocks)
    @JoinColumn({ name: "ledger_id" })
    public ledger: LedgerEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): LedgerBlock {
        return TransformUtil.fromClass<LedgerBlock>(this, options);
    }
}
