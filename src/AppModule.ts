import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from './database/DatabaseModule';
import { LedgerModule } from './ledger/LedgerModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthcheckModule } from './healthcheck/HealthcheckModule';

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
                TypeOrmModule.forRoot(DatabaseModule.getOrmConfig(settings)),
                DatabaseModule.forRoot(),
                TransportModule.forRoot({ type: TransportType.LOCAL }),
                LedgerModule.forRoot(settings),
                HealthcheckModule,
            ],
            providers: [],
            controllers: [],
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor() {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {}
}
