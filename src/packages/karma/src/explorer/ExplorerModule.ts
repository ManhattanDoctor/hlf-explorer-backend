import { DynamicModule, Provider } from '@nestjs/common';
import { ExplorerService } from './service/ExplorerService';
import { MonitorService } from './service/MonitorService';
import { AppSettings } from '../../AppSettings';
import { Logger, ILogger } from '@ts-core/common/logger';
import { StateCheckHandler } from './controller/StateCheckHandler';
import { BlockParseHandler } from './controller/BlockParseHandler';
import { StatusController } from './controller/StatusController';
import { ApiMonitor } from './service/ApiMonitor';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { ActionListController } from './controller/ActionListController';

export class ExplorerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        const providers: Array<Provider> = [
 
        ];
        return {
            module: ExplorerModule,
            controllers: [],
            providers,
            exports: providers
        };
    }
}
