import { DynamicModule, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { TransportModule, TransportType, LoggerModule, CacheModule } from '@ts-core/backend-nestjs';
import { AppSettings } from './AppSettings';
import { DatabaseModule } from '@project/module/database';
import { LedgerModule } from '@project/module/ledger';
import { SocketModule } from '@project/module/socket';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Transport, Logger } from '@ts-core/common';
import { IDatabaseSettings } from '@ts-core/backend';
import { modulePath } from '@project/module';
import { AbstractService } from '@project/module/core';
import { HealthcheckModule } from '@project/module/healthcheck';
import * as fabricLogger from 'fabric-network/lib/logger';
import {
    LedgerBlockParsedEvent,
    LedgerBatchCommand,
    LedgerBlockParseCommand,
    LedgerStateCheckCommand,
} from '@project/module/ledger/transport';
import { TlsOptions } from 'tls';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import * as _ from 'lodash';

export class AppModule extends AbstractService<AppSettings> implements OnApplicationBootstrap {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: AppSettings): DynamicModule {
        return {
            module: AppModule,
            imports: [
                DatabaseModule,
                LoggerModule.forRoot(settings),

                CacheModule.forRoot(),
                LedgerModule.forRoot(settings.ledgersSettingsPath),
                TypeOrmModule.forRoot(this.getOrmConfig(settings)[0]),
                TransportModule.forRoot({ type: TransportType.LOCAL }),

                SocketModule,
                HealthcheckModule,

                PrometheusModule.register(),
            ],
            providers: [
                {
                    provide: AppSettings,
                    useValue: settings,
                },
            ],
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public static getOrmConfig(settings: IDatabaseSettings): Array<TypeOrmModuleOptions> {
        let ssl: TlsOptions = undefined;
        if (!_.isNil(process.env.SSL_CA)) {
            ssl = { ca: process.env.SSL_CA };
        }
        return [
            {
                type: 'postgres',
                host: settings.databaseHost,
                port: settings.databasePort,
                username: settings.databaseUserName,
                password: settings.databaseUserPassword,
                database: settings.databaseName,

                synchronize: false,
                logging: false,
                entities: [`${modulePath()}/database/**/*Entity.{ts,js}`],
                migrations: [__dirname + '/migration/*.{ts,js}'],
                migrationsRun: true,
                ssl,
            },
        ];
    }

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    public constructor(@Inject(Logger) logger: Logger, settings: AppSettings, private transport: Transport) {
        super('HLF Explorer API', settings, logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();
        if (this.settings.isTest) {
            this.warn(`Service works in ${this.settings.mode}: some functions could work different way`);
        }

        fabricLogger.getLogger('Transaction').transports.console.silent = true;
        if (this.settings.isSystemLogsEnabled) {
            return;
        }
        this.transport.logEventFilters.push(event => event.name !== LedgerBlockParsedEvent.NAME);
        this.transport.logCommandFilters.push(command => command.name !== LedgerBatchCommand.NAME);
        this.transport.logCommandFilters.push(command => command.name !== LedgerBlockParseCommand.NAME);
        this.transport.logCommandFilters.push(command => command.name !== LedgerStateCheckCommand.NAME);
    }
}
