import { TransformUtil } from '@ts-core/common/util';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { ICoinObject, CoinObject } from '@karma/common/transport/command/coin';
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoinBurnedEvent extends TransportEvent<ICoinBurnedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COIN_BURNED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICoinBurnedDto) {
        super(CoinBurnedEvent.NAME, TransformUtil.toClass(CoinBurnedDto, data));
    }
}

export interface ICoinBurnedDto extends IKarmaLedgerEventDto {
    from: ICoinObject;
}

export class CoinBurnedDto extends KarmaLedgerEventDto implements ICoinBurnedDto {
    @Type(() => CoinObject)
    @IsDefined()
    @ValidateNested()
    from: CoinObject;
}