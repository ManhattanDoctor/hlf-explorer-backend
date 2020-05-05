import { LedgerBlock, LedgerBlockTransaction } from '@hlf-explorer/common/ledger';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { Transform, Exclude, Type } from 'class-transformer';
import { IsJSON, IsDefined, IsDate, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, JoinTable, OneToMany, Index, JoinColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LedgerEntity } from './LedgerEntity';
import { Block } from 'fabric-client';
import { LedgerBlockTransactionEntity } from './LedgerBlockTransactionEntity';

@Entity()
@Index(['hash', 'ledgerId', 'number'])
@Index(['hash', 'ledgerId'], { unique: true })
export class LedgerBlockEntity implements LedgerBlock {
    
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
    public hash: string;

    @Column()
    @IsNumber()
    public number: number;

    @Column({ name: 'created_date' })
    @IsDate()
    @Type(() => Date)
    public createdDate: Date;

    @Column({ name: 'raw_data', type: 'json' })
    @IsDefined()
    public rawData: Block;

    @Column({ name: 'ledger_id' })
    @IsNumber()
    public ledgerId: number;

    @ManyToOne(
        () => LedgerEntity,
        item => item.blocksEntity
    )
    @JoinColumn({ name: 'ledger_id' })
    public ledger: LedgerEntity;

    @Type(() => LedgerBlockTransactionEntity)
    @OneToMany(
        () => LedgerBlockTransactionEntity,
        item => item.block,
        { cascade: true, eager: true }
    )
    @JoinTable()
    public transactions: Array<LedgerBlockTransactionEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public update(data: Partial<LedgerBlock>): void {
        ObjectUtil.copyProperties(data, this);
    }
}
