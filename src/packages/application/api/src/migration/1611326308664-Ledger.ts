import { MigrationInterface, QueryRunner } from 'typeorm';

export class Ledger1611326308664 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "ledger"
            (                
                "id" serial not null
                    constraint "ledger_id_pkey" primary key,
                "name" varchar not null,
                "block_height" integer not null,
                "block_frequency" integer not null,
                "block_height_parsed" integer not null,

                "is_batch" boolean
            );

            create unique index "ledger_name" on "ledger" (name);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "ledger" cascade;
            drop index if exists "ledger_name";
        `;
        await queryRunner.query(sql);
    }
}
