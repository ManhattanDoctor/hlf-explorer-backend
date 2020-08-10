import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { DefaultController } from '@ts-core/backend-nestjs/controller';
import { Logger } from '@ts-core/common/logger';
import * as _ from 'lodash';
import { ExplorerService } from '../../service/ExplorerService';

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

export class BlockListUnparsedResponse {
    @ApiProperty({ isArray: true, type: Number })
    items: Array<number>;

    @ApiProperty()
    total: number;
}

// --------------------------------------------------------------------------
//
//  Controller
//
// --------------------------------------------------------------------------

@Controller('api/blocks/unparsed')
export class BlockListUnparsedController extends DefaultController<void, BlockListUnparsedResponse> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private service: ExplorerService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: `Unparsed blocks list` })
    @ApiOkResponse({ type: BlockListUnparsedResponse })
    public async execute(): Promise<BlockListUnparsedResponse> {
        let items = await this.service.getUnparsedBlocks(0, await this.service.getLastBlockHeight(ExplorerService.LEDGER_NAME));
        return {
            total: items.length,
            items
        };
    }
}
