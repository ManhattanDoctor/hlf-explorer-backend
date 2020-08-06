import { TransformUtil } from '@ts-core/common/util';
import { TransportEvent } from '@ts-core/common/transport';
import { KarmaLedgerEvent, IKarmaLedgerEventDto, KarmaLedgerEventDto } from '../KarmaLedgerEvent';
import { ICoinObject, CoinObject } from '../../command/coin';
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoinEmittedEvent extends TransportEvent<ICoinEmittedDto> {
    // --------------------------------------------------------------------------
    //
    //  Public Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = KarmaLedgerEvent.COIN_EMITTED;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: ICoinEmittedDto) {
        super(CoinEmittedEvent.NAME, TransformUtil.toClass(CoinEmittedDto, data));
    }
}

export interface ICoinEmittedDto extends IKarmaLedgerEventDto {
    to: ICoinObject;
}

export class CoinEmittedDto extends KarmaLedgerEventDto implements ICoinEmittedDto {
    @Type(() => CoinObject)
    @IsDefined()
    @ValidateNested()
    to: CoinObject;
}
