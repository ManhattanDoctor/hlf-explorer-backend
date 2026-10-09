import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerBlockEvent1611326308668 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "ledger_block_event"
            (                
                "id" serial not null
                    constraint "ledger_block_event_id_pkey" primary key,
                "ledger_id" integer
                    constraint "ledger_block_ledger_id_fkey" references "ledger",
                "block_id" integer
                    constraint "ledger_block_event_ledger_block_id_fkey" references "ledger_block",
                "uid" varchar not null,
                "name" varchar not null,
                "request_id" varchar not null,
                "transaction_hash" varchar not null,
                "transaction_validation_code" integer not null,
                "channel" varchar not null,
                "chaincode" varchar not null,
                "block_number" integer not null,
                "date" timestamp not null,

                "data" json
            );

            create unique index "ledger_block_event_ukey_block_id_uid" on "ledger_block_event" (block_id, uid);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "ledger_block_event" cascade;
            drop index if exists "ledger_block_event_ukey_block_id_uid";
        `;
        await queryRunner.query(sql);
    }
}
