import { LedgerBlock } from '@hlf-explorer/common/ledger';
import { TransformUtil, ObjectUtil } from '@ts-core/common/util';
import { Exclude, Type } from 'class-transformer';
import { IsEnum, IsDefined, IsUUID, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Index, JoinColumn, ManyToOne, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ITransportFabricTransactionChaincode } from '@ts-core/blockchain-fabric/transport/block';
import { ITransportFabricRequestPayload } from '@ts-core/blockchain-fabric/transport/TransportFabricRequestPayload';
import { ITransportFabricResponsePayload } from '@ts-core/blockchain-fabric/transport/TransportFabricResponsePayload';
import { FabricTransactionValidationCode } from '@ts-core/blockchain-fabric/api';
import { LedgerBlockEntity } from './LeggerBlockEntity';
import { LedgerBlockTransaction } from '@hlf-explorer/common/ledger';

@Entity()
@Index(['hash', 'blockId', 'blockNumber', 'ledgerId', 'requestId', 'requestUserId'])
@Index(['hash', 'blockId'], { unique: true })
export class LedgerBlockTransactionEntity implements LedgerBlockTransaction {
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
    @IsString()
    public channel: string;

    @Column()
    @IsNumber()
    public blockNumber: number;

    @Column({ name: 'created_date' })
    @IsDate()
    @Type(() => Date)
    public createdDate: Date;

    @Column({ name: 'validation_code' })
    @IsEnum(FabricTransactionValidationCode)
    public validationCode: FabricTransactionValidationCode;

    @Column({ type: 'json', nullable: true })
    @IsOptional()
    public chaincode: ITransportFabricTransactionChaincode;

    @Column({ type: 'json', nullable: true })
    @IsOptional()
    public request: ITransportFabricRequestPayload;

    @Column({ type: 'json', nullable: true })
    @IsOptional()
    public response: ITransportFabricResponsePayload;

    @Column({ name: 'request_id', nullable: true })
    @IsOptional()
    @IsUUID()
    public requestId: string;

    @Column({ name: 'request_name', nullable: true })
    @IsOptional()
    @IsString()
    public requestName: string;

    @Column({ name: 'request_user_id', nullable: true })
    @IsOptional()
    @IsString()
    public requestUserId: string;

    @Column({ name: 'response_error_code', nullable: true })
    @IsOptional()
    @IsNumber()
    public responseErrorCode: number;

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

    public update(data: Partial<LedgerBlockTransaction>): void {
        ObjectUtil.copyProperties(data, this);
    }
}
