import { Ledger } from '@hlf-explorer/common/ledger';
import { TypeormDecimalTransformer } from '@ts-core/backend/database/typeorm';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, OneToMany, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { LedgerBlockEntity } from './LeggerBlockEntity';

@Entity()
export class LedgerEntity implements Ledger {
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
    @Index({ unique: true })
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

    @OneToMany(
        () => LedgerBlockEntity,
        item => item.ledger,
        { cascade: true }
    )
    public blocksEntity: Promise<Array<LedgerBlockEntity>>;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async update(data: Partial<Ledger>): Promise<void> {
        ObjectUtil.copyProperties(data, this);
    }

    public toObject(): Ledger {
        return TransformUtil.fromClass<Ledger>(this, { excludePrefixes: ['__'] });
    }
}
