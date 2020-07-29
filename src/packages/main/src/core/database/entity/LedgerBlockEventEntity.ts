import { ObjectUtil } from '@ts-core/common/util';
import { Exclude, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Index, JoinColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LedgerBlockEntity } from './LeggerBlockEntity';
import { LedgerBlockEvent } from '@hlf-explorer/common/ledger';

@Entity()
// @Index(['transactionHash', 'blockId', 'blockNumber', 'ledgerId', 'name'])
export class LedgerBlockEventEntity<T = any> implements LedgerBlockEvent<T> {
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
    public name: string;

    @Column({ name: 'transaction_hash' })
    @IsString()
    public transactionHash: string;

    @Column()
    @IsString()
    public channel: string;

    @Column()
    @IsString()
    public chaincode: string;

    @Column({ type: 'json', nullable: true })
    @IsOptional()
    @IsString()
    public data?: T;

    @Column({ name: 'block_number' })
    @IsNumber()
    public blockNumber: number;

    @Column({ name: 'created_date' })
    @IsDate()
    @Type(() => Date)
    public createdDate: Date;

    @Exclude()
    @ManyToOne(
        () => LedgerBlockEntity,
        item => item.transactions
    )
    @JoinColumn({ name: 'block_id' })
    public block: LedgerBlockEntity;

    @Column({ name: 'block_id' })
    @IsNumber()
    public blockId: number;

    @Column({ name: 'ledger_id' })
    @IsNumber()
    public ledgerId: number;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public update(data: Partial<LedgerBlockEvent>): void {
        ObjectUtil.copyProperties(data, this);
    }
}
