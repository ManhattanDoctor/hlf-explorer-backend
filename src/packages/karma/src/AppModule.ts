import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import * as _ from 'lodash';
import { ILogger } from '@ts-core/common/logger';
import { LedgerApi, LedgerApiSocket } from '@hlf-explorer/common/api';
import { ExplorerService } from './service/ExplorerService';
import { StateCheckHandler } from './handler/StateCheckHandler';
import { ActionListController } from './controller/ActionListController';
import { StatusController } from './controller/StatusController';
import { BlockParseHandler } from './handler/BlockParseHandler';
import { DatabaseModule } from './database/DatabaseModule';
import { UserListCommand } from '@karma/common/transport/command/user';
import { Transport } from '@ts-core/common/transport';
import { BlockParseCommand } from './transport/command/BlockParseCommand';
import { GenesisGetCommand } from '@karma/common/transport/command';
import { SocketMonitor } from './service/SocketMonitor';

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
                    provide: LedgerApi,
                    inject: [Logger],
                    useFactory: async (logger: ILogger) => {
                        let item = new LedgerApi(logger);
                        item.url = settings.hlfExplorerEndpoint;
                        return item;
                    }
                },
                {
                    provide: SocketMonitor,
                    inject: [Logger, LedgerApi],
                    useFactory: async (logger: ILogger, api: LedgerApi) => {
                        return new SocketMonitor(logger, api);
                    }
                },
                {
                    provide: LedgerApiSocket,
                    useExisting: SocketMonitor
                },

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

    public constructor(
        @Inject(LedgerApiSocket) private monitor: SocketMonitor,
        private api: LedgerApi,
        private transport: Transport,
        private service: ExplorerService
    ) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await Promise.all([this.service.initialize(), this.monitor.initialize()]);
        // this.transport.send(new BlockParseCommand({ ledgerId: 1, number: 81 }));
        // console.log(await this.api.commandSendListen(new GenesisGetCommand()));
    }
}
