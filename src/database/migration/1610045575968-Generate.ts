import {MigrationInterface, QueryRunner} from "typeorm";

export class Generate1610045575968 implements MigrationInterface {
    name = 'Generate1610045575968'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ledger_block_event" ADD "is_batch" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" ADD "is_batch" boolean`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" ADD "block_batched" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_event" ADD CONSTRAINT "FK_59982a3ae9607685801b9447028" FOREIGN KEY ("block_id") REFERENCES "ledger_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" ADD CONSTRAINT "FK_6a6435366e7a0ba5a8734223ed5" FOREIGN KEY ("block_id") REFERENCES "ledger_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" DROP CONSTRAINT "FK_6a6435366e7a0ba5a8734223ed5"`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_event" DROP CONSTRAINT "FK_59982a3ae9607685801b9447028"`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" DROP COLUMN "block_batched"`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_transaction" DROP COLUMN "is_batch"`, undefined);
        await queryRunner.query(`ALTER TABLE "ledger_block_event" DROP COLUMN "is_batch"`, undefined);
    }

}
