import { Exclude, Type, ClassTransformOptions } from 'class-transformer';
import { IsDate, IsDefined, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, ManyToOne, JoinColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LedgerBlockEvent } from '@hlf-explorer/common';
import { TransformUtil } from '@ts-core/common';
import { LedgerBlockEntity } from './LedgerBlockEntity';
import { LedgerEntity } from '../ledger';

@Entity('ledger_block_event')
export class LedgerBlockEventEntity<T = any> implements LedgerBlockEvent<T> {
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
    public uid: string;

    @Column()
    @IsString()
    public name: string;

    @Column({ name: 'request_id' })
    @IsString()
    public requestId: string;

    @Column({ name: 'transaction_hash' })
    @IsString()
    public transactionHash: string;

    @Column({ name: 'transaction_validation_code' })
    @IsNumber()
    public transactionValidationCode: number;

    @Column()
    @IsString()
    public channel: string;

    @Column()
    @IsString()
    public chaincode: string;

    @Column({ name: 'block_number' })
    @IsNumber()
    public blockNumber: number;

    @Column({ type: 'json', nullable: true })
    @IsOptional()
    @IsDefined()
    public data?: T;

    @Column()
    @IsDate()
    @Type(() => Date)
    public date: Date;

    @Exclude()
    @Column({ name: 'block_id' })
    @IsNumber()
    @IsOptional()
    public blockId: number;

    @Exclude()
    @Column({ name: 'ledger_id' })
    @IsNumber()
    public ledgerId: number;

    @Exclude()
    @ManyToOne(() => LedgerBlockEntity, item => item.events)
    @JoinColumn({ name: "block_id" })
    public block: LedgerBlockEntity;

    @Exclude()
    @ManyToOne(() => LedgerEntity, item => item.events)
    @JoinColumn({ name: "ledger_id" })
    public ledger: LedgerEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): LedgerBlockEvent<T> {
        return TransformUtil.fromClass<LedgerBlockEvent<T>>(this, options);
    }
}
