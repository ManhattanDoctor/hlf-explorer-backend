import { TransformUtil } from '@ts-core/common';
import { TypeormValidableEntity } from '@ts-core/backend';
import { Exclude, Type, ClassTransformOptions } from 'class-transformer';
import { IsDate, IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ManyToOne, JoinColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
    LedgerBlockTransaction,
    ILedgerBlockTransactionResponsePayload,
    ILedgerBlockTransactionRequestPayload,
    ILedgerBlockTransactionChaincode,
} from '@hlf-explorer/common';
import { LedgerBlockEntity } from './LedgerBlockEntity';
import { LedgerEntity } from '../ledger';

@Entity('ledger_block_transaction')
export class LedgerBlockTransactionEntity extends TypeormValidableEntity implements LedgerBlockTransaction {
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
    @IsString()
    public channel: string;

    @Column({ name: 'block_number' })
    @IsNumber()
    public blockNumber: number;

    @Column()
    @IsDate()
    @Type(() => Date)
    public date: Date;

    @Column({ name: 'validation_code' })
    @IsNumber()
    public validationCode: number;

    @Column({ type: 'json' })
    @IsOptional()
    public chaincode: ILedgerBlockTransactionChaincode;

    @Column({ type: 'json' })
    @IsOptional()
    public request: ILedgerBlockTransactionRequestPayload;

    @Column({ type: 'json' })
    @IsOptional()
    public response: ILedgerBlockTransactionResponsePayload;

    @Column({ name: 'request_id' })
    @IsOptional()
    @IsString()
    public requestId: string;

    @Column({ name: 'request_name' })
    @IsOptional()
    @IsString()
    public requestName: string;

    @Column({ name: 'request_user_id' })
    @IsOptional()
    @IsString()
    public requestUserId: string;

    @Column({ name: 'response_error_code', type: 'varchar' })
    public responseErrorCode: string | number;

    @Column({ name: 'is_batch' })
    @IsOptional()
    @IsBoolean()
    public isBatch?: boolean;

    @Column({ name: 'block_received' })
    @IsOptional()
    @IsNumber()
    public blockReceived?: number;

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
    @ManyToOne(() => LedgerBlockEntity, item => item.transactions)
    @JoinColumn({ name: "block_id" })
    public block: LedgerBlockEntity;

    @Exclude()
    @ManyToOne(() => LedgerEntity, item => item.transactions)
    @JoinColumn({ name: "ledger_id" })
    public ledger: LedgerEntity;

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(options?: ClassTransformOptions): LedgerBlockTransaction {
        return TransformUtil.fromClass<LedgerBlockTransaction>(this, options);
    }
}
