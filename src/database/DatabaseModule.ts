import { DynamicModule, Provider, Global } from '@nestjs/common';
import { IDatabaseSettings } from '@ts-core/backend/settings';
import { DatabaseService } from './DatabaseService';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Global()
export class DatabaseModule {
    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static forRoot(): DynamicModule {
        const providers: Array<Provider> = [DatabaseService];
        return {
            module: DatabaseModule,
            providers,
            exports: providers,
        };
    }

    // --------------------------------------------------------------------------
    //
    //  Private Static Methods
    //
    // --------------------------------------------------------------------------

    public static getOrmConfig(settings: IDatabaseSettings): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: settings.databaseHost,
            port: settings.databasePort,
            username: settings.databaseUserName,
            password: settings.databaseUserPassword,
            database: settings.databaseName,
            logging: false,
            entities: [__dirname + '/**/*Entity.{ts,js}'],
            migrations: [__dirname + '/../database/migration/**/*.{ts,js}'],
            migrationsRun: false,
            cli: {
                migrationsDir: 'src/database/migration',
            },
            keepConnectionAlive: true,
            autoLoadEntities: true,
            namingStrategy: new SnakeNamingStrategy(),
        };
    }
}
