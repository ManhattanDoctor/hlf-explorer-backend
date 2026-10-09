import { TypeormUtil } from '@ts-core/backend';
import { DataSource } from 'typeorm';
import config from './ormconfig.migration';

// Сброс схемы перед миграциями. Штатный `typeorm schema:drop` не отличает объекты приложения
// от объектов расширений и в облачном PostgreSQL падает на первом же представлении
// pg_stat_statements; TypeormUtil.databaseDrop делает тот же сброс, пропуская всё, что
// принадлежит расширению

async function drop(): Promise<void> {
    let source = new DataSource({ ...config.options, entities: [], migrations: [], migrationsRun: false, synchronize: false } as any);
    await source.initialize();
    try {
        let { schema, relations, types, extensions } = await TypeormUtil.databaseDrop(source);
        console.log(`Schema "${schema}" dropped: ${relations} relations, ${types} types`);
        if (extensions.length > 0) {
            console.log(`Extensions left untouched: ${extensions.join(', ')}`);
        }
    }
    finally {
        await source.destroy();
    }
}

drop().catch(error => {
    console.error(error);
    process.exit(1);
});
