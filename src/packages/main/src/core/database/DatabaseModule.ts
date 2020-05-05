import { DynamicModule, Provider, Module, Global } from '@nestjs/common';
import { IDatabaseSettings } from '@ts-core/backend/settings';
import { Logger } from '@ts-core/common/logger';
import { Connection, createConnection } from 'typeorm';
import { ConnectionOptions } from 'typeorm/connection/ConnectionOptions';
import { DatabaseService } from './DatabaseService';

@Global()
export class DatabaseModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(settings: IDatabaseSettings): DynamicModule {
        const providers: Array<Provider> = [
            {
                provide: Connection,
                inject: [Logger],
                useFactory: async (logger: Logger) => {
                    let config = DatabaseModule.getOrmConfig(settings);
                    logger.debug(`Connecting to ${config.type} ${settings.databaseHost}:${settings.databasePort}/${settings.databaseName}`, 'DataBaseModule');
                    return await createConnection(config);
                }
            },
            DatabaseService
        ];
        return {
            module: DatabaseModule,
            providers,
            exports: providers
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Static Methods
    //
    // --------------------------------------------------------------------------

    public static getOrmConfig(settings: IDatabaseSettings): ConnectionOptions {
        return {
            type: 'postgres',
            host: settings.databaseHost,
            port: settings.databasePort,
            username: settings.databaseUserName,
            password: settings.databaseUserPassword,
            database: settings.databaseName,
            synchronize: true,
            logging: false,
            entities: [__dirname + '/**/*Entity.{ts,js}'],
            migrations: [__dirname + '/migration/*.{ts,js}'],
            migrationsRun: false,
            cli: {
                migrationsDir: 'src/migration'
            }
        };
    }
}
