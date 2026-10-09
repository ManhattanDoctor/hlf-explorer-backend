import { MigrationInterface, QueryRunner } from 'typeorm';

export class LedgerBlockRaw1611326308666 implements MigrationInterface {
    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            create table if not exists "ledger_block_raw"
            (                
                "id" serial not null
                    constraint "ledger_block_raw_id_pkey" primary key,
                "block_id" integer
                    constraint "ledger_block_raw_ledger_block_id_ukey" unique
                    constraint "ledger_block_raw_ledger_block_id_fkey" references "ledger_block",
                "data" json not null
            );
        `;
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = `
            drop table if exists "ledger_block_raw" cascade;
        `;
        await queryRunner.query(sql);
    }
}
