import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Column, OneToOne, JoinColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IFabricBlock } from '@hlf-core/api';
import { LedgerBlockEntity } from './LedgerBlockEntity';
import * as _ from 'lodash';

@Entity('ledger_block_raw')
export class LedgerBlockRawEntity extends TypeormValidableEntity {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @PrimaryGeneratedColumn()
    @IsOptional()
    @IsNumber()
    public id: number;

    @Column({ type: 'json' })
    public data: IFabricBlock;

    @Exclude()
    @Column({ name: 'block_id' })
    @IsNumber()
    @IsOptional()
    public blockId: number;

    @Exclude()
    @OneToOne(() => LedgerBlockEntity, item => item.data)
    @JoinColumn({ name: 'block_id' })
    public block: LedgerBlockEntity;
}
