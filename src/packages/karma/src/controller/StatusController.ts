import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { ExplorerService } from '../service/ExplorerService';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class StatusDtoResponse {
    @ApiProperty()
    url: string;

    @ApiProperty()
    ledgerId: number;

    @ApiProperty()
    ledgerName: string;

    @ApiProperty()
    ledgerBlockLast: number;

    @ApiProperty()
    blockHeight: number;

    @ApiProperty()
    blockHeightParsed: number;

    @ApiProperty()
    blocksUnparsed: Array<number>;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/status')
export class StatusController extends DefaultController<void, StatusDtoResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private api: LedgerApi, private service: ExplorerService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Get status` })
    @ApiOkResponse({ type: StatusDtoResponse })
    public async execute(): Promise<StatusDtoResponse> {
        let info = await this.service.ledgerGet();
        let ledgerInfo = await this.api.getInfo(info.name);
        let ledgerBlockLast = ledgerInfo.blockLast.number;

        return {
            url: this.api.url,
            ledgerId: info.id,
            ledgerName: info.name,
            ledgerBlockLast,
            blockHeight: info.blockHeight,
            blockHeightParsed: info.blockHeightParsed,
            blocksUnparsed: await this.service.getUnparsedBlocks(0, ledgerBlockLast)
        };
    }
}
