import { DynamicModule, Provider, CacheModule } from '@nestjs/common';
import { LedgerBlockGetController } from './controller/block/LedgerBlockGetController';
import { LedgerBlockListController } from './controller/block/LedgerBlockListController';
import { LedgerService } from './service/LedgerService';
import { LedgerApiFactory } from './service/LedgerApiFactory';
import { LedgerMonitorService } from './service/LedgerMonitorService';
import { LedgerStateChecker } from './service/LedgerStateChecker';
import { LedgerBlockParseHandler } from './controller/LedgerBlockParseHandler';
import { LedgerStateCheckHandler } from './controller/LedgerStateCheckHandler';
import { LEDGER_SOCKET_NAMESPACE } from '@hlf-explorer/common/api/ledger';
import { DatabaseModule } from '../../core/database/DatabaseModule';
import { IFabricApiSettings } from '@ts-core/blockchain-fabric/api';
import { DatabaseService } from '../../core/database/DatabaseService';
import { Logger } from '@ts-core/common/logger';
import { LedgerBlockTransactionGetController } from './controller/transaction/LedgerBlockTransactionGetController';
import { LedgerBlockTransactionListController } from './controller/transaction/LedgerBlockTransactionListController';
import { LedgerSearchController } from './controller/LedgerSearchController';

export class LedgerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IFabricApiSettings): DynamicModule {
        const providers: Array<Provider> = [
            {
                provide: LEDGER_SOCKET_NAMESPACE,
                inject: [LedgerService],
                useFactory: async (ledger: LedgerService) => {
                    await ledger.initialize();
                    return LEDGER_SOCKET_NAMESPACE;
                }
            },
            {
                provide: LedgerApiFactory,
                useFactory: (logger: Logger, database: DatabaseService) => {
                    return new LedgerApiFactory(logger, database, settings);
                }
            },

            LedgerService,
            LedgerMonitorService,
            LedgerStateChecker,
            LedgerBlockParseHandler,
            LedgerStateCheckHandler
        ];
        return {
            module: LedgerModule,
            controllers: [
                LedgerSearchController,
                LedgerBlockGetController,
                LedgerBlockListController,
                LedgerBlockTransactionGetController,
                LedgerBlockTransactionListController
            ],
            providers,
            exports: providers
        };
    }
}
