import { DynamicModule, Provider, CacheModule } from '@nestjs/common';
import { LedgerBlockGetController } from './controller/block/LedgerBlockGetController';
import { LedgerBlockListController } from './controller/block/LedgerBlockListController';
import { LedgerService } from './service/LedgerService';
import { LedgerApiFactory } from './service/LedgerApiFactory';
import { LedgerMonitorService } from './service/LedgerMonitorService';
import { LedgerBlockParseHandler } from './handler/LedgerBlockParseHandler';
import { LedgerStateCheckHandler } from './handler/LedgerStateCheckHandler';
import { LEDGER_SOCKET_NAMESPACE } from '@hlf-explorer/common/api/ledger';
import { IFabricApiSettings } from '@ts-core/blockchain-fabric/api';
import { DatabaseService } from '../database/DatabaseService';
import { Logger } from '@ts-core/common/logger';
import { LedgerBlockTransactionGetController } from './controller/transaction/LedgerBlockTransactionGetController';
import { LedgerBlockTransactionListController } from './controller/transaction/LedgerBlockTransactionListController';
import { LedgerSearchController } from './controller/LedgerSearchController';
import { LedgerBlockEventGetController } from './controller/event/LedgerBlockEventGetController';
import { LedgerBlockEventListController } from './controller/event/LedgerBlockEventListController';
import { LedgerInfoGetController } from './controller/info/LedgerInfoGetController';
import { LedgerInfoListController } from './controller/info/LedgerInfoListController';
import { ITransportFabricSettings } from '@ts-core/blockchain-fabric/transport';
import { LedgerTransportFactory } from './service/LedgerTransportFactory';
import { LedgerCommandController } from './controller/LedgerCommandController';

export class LedgerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: ITransportFabricSettings): DynamicModule {
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
                useFactory: (logger: Logger) => {
                    return new LedgerApiFactory(logger, settings);
                }
            },
            {
                provide: LedgerTransportFactory,
                useFactory: (logger: Logger) => {
                    return new LedgerTransportFactory(logger, settings);
                }
            },

            LedgerService,
            LedgerMonitorService,
            LedgerBlockParseHandler,
            LedgerStateCheckHandler
        ];
        return {
            module: LedgerModule,
            controllers: [
                LedgerSearchController,
                LedgerCommandController,

                LedgerInfoGetController,
                LedgerInfoListController,
                LedgerBlockGetController,
                LedgerBlockListController,
                LedgerBlockEventGetController,
                LedgerBlockEventListController,
                LedgerBlockTransactionGetController,
                LedgerBlockTransactionListController
            ],
            providers,
            exports: providers
        };
    }
}
