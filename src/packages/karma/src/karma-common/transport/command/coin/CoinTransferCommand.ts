import { TransportCommandFabricAsync } from '@ts-core/blockchain-fabric/transport/command/TransportCommandFabricAsync';
import { ITraceable } from '@ts-core/common/trace';
import { TransformUtil } from '@ts-core/common/util';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested, IsEnum } from 'class-validator';
import { KarmaLedgerCommand } from '../KarmaLedgerCommand';
import { LedgerCoinId } from '../../../ledger/coin';
import { ICoinObject, CoinObject } from './ICoinObject';
import { ICoinAmount, CoinAmount } from './ICoinAmount';

export class CoinTransferCommand extends TransportCommandFabricAsync<ICoinTransferDto, void> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerCommand.COIN_TRANSFER;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ICoinTransferDto) {
        super(CoinTransferCommand.NAME, TransformUtil.toClass(CoinTransferDto, request));
    }
}

export interface ICoinTransferDto extends ITraceable {
    to: ICoinObject;
    from: ICoinObject;
    amount: ICoinAmount;
}

class CoinTransferDto implements ICoinTransferDto {
    @Type(() => CoinObject)
    @IsDefined()
    @ValidateNested()
    to: CoinObject;

    @Type(() => CoinObject)
    @IsDefined()
    @ValidateNested()
    from: CoinObject;

    @Type(() => CoinAmount)
    @IsDefined()
    @ValidateNested()
    amount: CoinAmount;

    @IsEnum(LedgerCoinId)
    coinId: LedgerCoinId;
}
