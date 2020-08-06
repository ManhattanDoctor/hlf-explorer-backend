import { Exclude, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { Column, Index, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['number'], { unique: true })
export class LedgerBlockEntity {
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
    @IsNumber()
    public number: number;

    @Column({ name: 'created_date' })
    @IsDate()
    @Type(() => Date)
    public createdDate: Date;
}
