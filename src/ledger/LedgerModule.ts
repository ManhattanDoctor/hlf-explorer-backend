import { DynamicModule, Provider } from '@nestjs/common';
import { LedgerBlockGetController } from './controller/block/LedgerBlockGetController';
import { LedgerBlockListController } from './controller/block/LedgerBlockListController';
import { LedgerService } from './service/LedgerService';
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
import { LedgerTransportFactory } from './service/LedgerTransportFactory';
import { LedgerRequestController } from './controller/LedgerRequestController';
import { LedgerGuard } from './service/guard/LedgerGuard';
import { LedgerGuardPaginable } from './service/guard/LedgerGuardPaginable';
import { LedgerSettings } from './service/LedgerSettings';
import { LedgerResetController } from './controller/LedgerResetController';

export class LedgerModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(ledgersSettingsPath: string): DynamicModule {
        const providers: Array<Provider> = [
            {
                provide: LEDGER_SOCKET_NAMESPACE,
                inject: [LedgerService],
                useFactory: async (ledger: LedgerService) => {
                    await ledger.initialize();
                    return LEDGER_SOCKET_NAMESPACE;
                },
            },
            {
                provide: LedgerSettings,
                inject: [Logger],
                useFactory: async (logger: ILogger) => {
                    let item = new LedgerSettings(logger);
                    await item.load(ledgersSettingsPath);
                    return item;
                },
            },

            LedgerTransportFactory,

            LedgerGuard,
            LedgerGuardPaginable,

            LedgerService,
            LedgerApiMonitor,
            LedgerBlockParseHandler,
            LedgerStateCheckHandler,
        ];
        return {
            module: LedgerModule,
            controllers: [
                LedgerResetController,
                LedgerSearchController,
                LedgerRequestController,

                LedgerInfoGetController,
                LedgerInfoListController,
                LedgerBlockGetController,
                LedgerBlockListController,
                LedgerBlockEventGetController,
                LedgerBlockEventListController,
                LedgerBlockTransactionGetController,
                LedgerBlockTransactionListController,
            ],
            providers,
            exports: providers,
        };
    }
}
