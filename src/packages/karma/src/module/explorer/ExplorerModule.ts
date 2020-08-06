import { DynamicModule, Provider } from '@nestjs/common';
import { ExplorerService } from './service/ExplorerService';
import { MonitorService } from './service/MonitorService';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { AppSettings } from '../../AppSettings';
import { Logger, ILogger } from '@ts-core/common/logger';
import { Transport, ITransport } from '@ts-core/common/transport';
import { DatabaseService } from '../database/DatabaseService';
import { StateCheckHandler } from './controller/StateCheckHandler';

export class ExplorerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        const providers: Array<Provider> = [
            {
                provide: LedgerApi,
                inject: [Logger],
                useFactory: async (logger: ILogger) => {
                    let item = new LedgerApi(logger, settings.hlfExplorerEndpoint);
                    return item;
                }
            },
            MonitorService,
            ExplorerService,

            StateCheckHandler
            /*
            LedgerStateChecker,
            LedgerBlockParseHandler,
            LedgerStateCheckHandler
            */
        ];
        return {
            module: ExplorerModule,
            controllers: [],
            providers,
            exports: providers
        };
    }
}
