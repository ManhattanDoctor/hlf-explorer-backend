import { DynamicModule, HttpModule, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { CacheModule } from '@ts-core/backend-nestjs/cache';
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';
import MemoryStore from 'cache-manager-memory-store';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from './module/database/DatabaseModule';
import { LedgerModule } from './module/ledger/LedgerModule';
import { Transport, ITransportEvent } from '@ts-core/common/transport';
import { FileUtil } from '@ts-core/backend/file';
import { TransportFabricBlockParser, ITransportFabricBlock } from '@ts-core/blockchain-fabric/transport/block';
import { IFabricBlock, FabricApi } from '@ts-core/blockchain-fabric/api';
import { TransformUtil } from '@ts-core/common/util';
import { LedgerApi } from '@hlf-explorer/common/api';
import { LedgerApiFactory } from './module/ledger/service/LedgerApiFactory';

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
            providers: [],
            controllers: []
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) private logger: Logger, private transport: Transport, private factory: LedgerApiFactory) {}

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        /*
        let api = await this.factory.get(0);

        let parser = new TransportFabricBlockParser();
        let block = await parser.parse(await api.getBlock(100));
        console.log(block.events);
        */
   
    }
}
