import { DynamicModule, Provider } from '@nestjs/common';
import { LedgerService, LedgerApiMonitor } from './service';
import { LedgerBlockParseHandler, LedgerBatchHandler, LedgerStateCheckHandler } from './transport/handler';
import { LEDGER_SOCKET_NAMESPACE } from '@hlf-explorer/common';
import { Logger, ILogger } from '@ts-core/common';
import { LedgerRequestController, LedgerSearchController, LedgerGetController, LedgerListController, LedgerBlockGetController, LedgerBlockListController, LedgerBlockTransactionGetController, LedgerBlockEventGetController, LedgerBlockEventListController, LedgerBlockTransactionListController, LedgerBlockLastGetController} from './controller';
import { LedgerSettingsFactory, LedgerTransportFactory } from './service';
import { DatabaseModule } from '@project/module/database';

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
                provide: LedgerSettingsFactory,
                inject: [Logger],
                useFactory: async (logger: ILogger) => {
                    let item = new LedgerSettingsFactory(logger);
                    await item.load(ledgersSettingsPath);
                    return item;
                },
            },

            LedgerTransportFactory,

            LedgerService,
            LedgerApiMonitor,
            LedgerBatchHandler,
            LedgerBlockParseHandler,
            LedgerStateCheckHandler,
        ];
        return {
            imports: [DatabaseModule],
            module: LedgerModule,
            controllers: [
                LedgerSearchController,
                LedgerRequestController,

                LedgerGetController,
                LedgerListController,
                LedgerBlockLastGetController,

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
