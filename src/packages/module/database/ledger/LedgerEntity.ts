import { Ledger } from '@hlf-explorer/common';
import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { ClassTransformOptions, Exclude, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { LedgerBlockEntity, LedgerBlockEventEntity, LedgerBlockTransactionEntity } from '../block';

@Entity('ledger')
export class LedgerEntity extends TypeormValidableEntity implements Ledger {
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
    public name: string;

    @Column({ name: 'block_height' })
    @IsInt()
    public blockHeight: number;

    @Column({ name: 'block_frequency' })
    @IsInt()
    public blockFrequency: number;

    @Column({ name: 'block_height_parsed' })
    @IsInt()
    public blockHeightParsed: number;

    @Column({ name: 'is_batch', nullable: true })
    @IsOptional()
    @IsBoolean()
    public isBatch?: boolean;

    @Exclude()
    @OneToMany(() => LedgerBlockEntity, item => item.ledger, { cascade: true })
    @Type(() => LedgerBlockEntity)
    @ValidateNested()
    public blocks: Array<LedgerBlockEntity>;

    @Exclude()
    @OneToMany(() => LedgerBlockEventEntity, item => item.ledger, { cascade: true })
    @Type(() => LedgerBlockEventEntity)
    @ValidateNested()
    public events: Array<LedgerBlockEventEntity>;

    @Exclude()
    @OneToMany(() => LedgerBlockTransactionEntity, item => item.ledger, { cascade: true })
    @Type(() => LedgerBlockTransactionEntity)
    @ValidateNested()
    public transactions: Array<LedgerBlockTransactionEntity>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): Ledger {
        return TransformUtil.fromClass<Ledger>(this, options);
    }
}
