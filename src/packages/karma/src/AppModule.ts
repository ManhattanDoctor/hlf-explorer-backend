import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import * as _ from 'lodash';
import { ApiMonitor } from './service/ApiMonitor';
import { ILogger } from '@ts-core/common/logger';
import { LedgerApi } from '@hlf-explorer/common/api/ledger';
import { MonitorService } from './service/MonitorService';
import { ExplorerService } from './service/ExplorerService';
import { StateCheckHandler } from './handler/StateCheckHandler';
import { ActionListController } from './controller/ActionListController';
import { StatusController } from './controller/StatusController';
import { BlockParseHandler } from './handler/BlockParseHandler';
import { DatabaseModule } from './database/DatabaseModule';

export class AppModule implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [
                HttpModule,
                CacheModule.forRoot({ store: MemoryStore }),
                LoggerModule.forRoot(settings),
                DatabaseModule.forRoot(settings),
                TransportModule.forRoot({ type: TransportType.LOCAL })
            ],
            providers: [
                {
                    provide: ApiMonitor,
                    inject: [Logger],
                    useFactory: async (logger: ILogger) => {
                        let item = new ApiMonitor(logger);
                        item.url = settings.hlfExplorerEndpoint;
                        return item;
                    }
                },
                {
                    provide: LedgerApi,
                    useExisting: ApiMonitor
                },

                MonitorService,
                ExplorerService,

                StateCheckHandler,
                BlockParseHandler
            ],
            controllers: [ActionListController, StatusController]
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(ApiMonitor) private monitor: ApiMonitor, private service: ExplorerService) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        // this.transport.send(new LedgerBlockParseCommand({ ledgerId: 1, number: 1 }));
        await Promise.all([this.service.initialize(), this.monitor.initialize()]);
    }
}
