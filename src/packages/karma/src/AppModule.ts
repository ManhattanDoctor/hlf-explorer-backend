import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from './module/database/DatabaseModule';
import { ExplorerModule } from './module/explorer/ExplorerModule';
import { Transport } from '@ts-core/common/transport';
import { LedgerApi, LedgerSocketEvent } from '@hlf-explorer/common/api/ledger';
import { filter } from 'rxjs/operators';
import { LoadableStatus, LoadableEvent, Loadable } from '@ts-core/common';
import { PromiseHandler } from '@ts-core/common/promise';
import { ExplorerService } from './module/explorer/service/ExplorerService';
import * as _ from 'lodash';
import { ExtendedError } from '@ts-core/common/error';

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
                TransportModule.forRoot({ type: TransportType.LOCAL }),
                ExplorerModule.forRoot(settings)
            ],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings
                }
            ],
            controllers: []
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) private logger: Logger, private transport: Transport, private api: LedgerApi, private service: ExplorerService) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        // this.transport.send(new LedgerBlockParseCommand({ ledgerId: 1, number: 1 }));

        let promise = PromiseHandler.create();
        this.api.events.subscribe(event => {
            switch (event.type) {
                case LoadableEvent.STATUS_CHANGED:
                    if (this.api.isLoaded) {
                        this.logger.log(`Connected successfully to ledger socket`);
                    } else if (this.api.isError) {
                        this.logger.error(`Disconnected from ledger socket: close application`);
                        process.exit(0);
                    }
                    break;

                case LedgerSocketEvent.LEDGERS:
                    if (!_.isEmpty(event.data.filter(item => item.name === ExplorerService.LEDGER_NAME))) {
                        this.logger.log(`Ledger "${ExplorerService.LEDGER_NAME}" found in ledger socket`);
                        promise.resolve();
                    } else {
                        this.logger.error(`Unable to find ledger "${ExplorerService.LEDGER_NAME}" in ledger socket: close application`);
                    }
            }
        });

        this.logger.log('Connecting to ledger socket...');
        this.api.connect();

        await Promise.all([promise.promise, this.service.initialize()]);
    }
}
