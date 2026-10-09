import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerBlock1611326308665 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "ledger_block"
            (                
                "id" serial not null
                    constraint "ledger_block_id_pkey" primary key,
                "ledger_id" integer
                    constraint "ledger_block_ledger_id_fkey" references "ledger",
                "hash" varchar not null,
                "date" timestamp not null,
                "number" integer not null,
                "events_count" integer not null,
                "transactions_count" integer not null
            );

            create unique index "ledger_block_ukey_ledger_id_hash" on "ledger_block" (ledger_id, hash);
            create unique index "ledger_block_ukey_ledger_id_number" on "ledger_block" (ledger_id, number);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "ledger_block" cascade;
            drop index if exists "ledger_block_ukey_ledger_id_hash";
            drop index if exists "ledger_block_ukey_ledger_id_number";
        `;
        await queryRunner.query(sql);
    }
}
