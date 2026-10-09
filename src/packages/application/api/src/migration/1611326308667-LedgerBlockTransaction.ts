import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerBlockTransaction1611326308666 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "ledger_block_transaction"
            (                
                "id" serial not null
                    constraint "ledger_block_transaction_id_pkey" primary key,
                "ledger_id" integer
                    constraint "ledger_block_ledger_id_fkey" references "ledger",
                "block_id" integer
                    constraint "ledger_block_transaction_ledger_block_id_fkey" references "ledger_block",
                "hash" varchar not null,
                "channel" varchar not null,
                "block_number" integer not null,
                "date" timestamp not null,
                "validation_code" integer not null,

                "chaincode" json,
                "request" json,
                "response" json,
                "request_id" varchar,
                "request_name" varchar,
                "request_user_id" varchar,
                "response_error_code" varchar,
                "is_batch" boolean,
                "block_received" integer
            );

            create unique index "ledger_block_transaction_ukey_block_id_hash" on "ledger_block_transaction" (block_id, hash);
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "ledger_block_transaction" cascade;
            drop index if exists "ledger_block_transaction_ukey_block_id_hash";
        `;
        await queryRunner.query(sql);
    }
}
