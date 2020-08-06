import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from './module/database/DatabaseModule';
import { LedgerModule } from './module/ledger/LedgerModule';
import { Transport } from '@ts-core/common/transport';

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
                LedgerModule.forRoot(settings)
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

    public constructor(@Inject(Logger) private logger: Logger, private transport: Transport) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        // this.transport.send(new LedgerBlockParseCommand({ ledgerId: 1, number: 1 }));
    }
}
