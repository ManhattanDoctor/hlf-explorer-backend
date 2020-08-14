import { DynamicModule, Provider } from '@nestjs/common';
import { LedgerBlockGetController } from './controller/block/LedgerBlockGetController';
import { LedgerBlockListController } from './controller/block/LedgerBlockListController';
import { LedgerService } from './service/LedgerService';
import { LedgerApiFactory } from './service/LedgerApiFactory';
import { LedgerApiMonitor } from './service/LedgerApiMonitor';
import { LedgerBlockParseHandler } from './handler/LedgerBlockParseHandler';
import { LedgerStateCheckHandler } from './handler/LedgerStateCheckHandler';
import { LEDGER_SOCKET_NAMESPACE } from '@hlf-explorer/common/api';
import { Logger, ILogger } from '@ts-core/common/logger';
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
                inject: [Logger],
                useFactory: (logger: ILogger) => {
                    return new LedgerApiFactory(logger, settings);
                }
            },
            {
                provide: LedgerTransportFactory,
                inject: [Logger],
                useFactory: (logger: ILogger) => {
                    return new LedgerTransportFactory(logger, settings);
                }
            },

            LedgerService,
            LedgerApiMonitor,
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
