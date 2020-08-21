import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1598016142789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = `
create table ledger_block_event
(
	id serial not null
		constraint "PK_13d75f8f46e66a76ea8cb21ac59"
			primary key,
	uid varchar not null,
	name varchar,
	transaction_hash varchar not null,
	channel varchar not null,
	chaincode varchar,
	data json,
	block_number integer not null,
	created_date timestamp not null,
	block_id integer not null,
	ledger_id integer not null
);

create unique index "IDX_c8fbff0330d89b8c891d785b6a"
	on ledger_block_event (uid, ledger_id);

create index "IDX_9ed301a51ed2e765977c059a3c"
	on ledger_block_event (uid, block_id, ledger_id, name);

create table ledger_block_transaction
(
	id serial not null
		constraint "PK_3796c5e151976bc976a825c1953"
			primary key,
	uid varchar not null,
	hash varchar not null,
	channel varchar not null,
	block_number integer not null,
	created_date timestamp not null,
	validation_code integer not null,
	chaincode json,
	request json,
	response json,
	request_id varchar,
	request_name varchar,
	request_user_id varchar,
	response_error_code integer,
	block_id integer not null,
	ledger_id integer not null
);

alter table ledger_block_transaction owner to "hlf-explorer";

create unique index "IDX_6467e6554579bdfd62c6014338"
	on ledger_block_transaction (uid, ledger_id);

create index "IDX_07db4f453985b2dd53d18a9a3a"
	on ledger_block_transaction (hash, block_id, request_id, request_user_id, ledger_id);

create table ledger
(
	id serial not null
		constraint "PK_7a322e9157e5f42a16750ba2a20"
			primary key,
	name varchar not null,
	block_height integer not null,
	block_frequency integer not null,
	block_height_parsed integer not null
);

alter table ledger owner to "hlf-explorer";

create unique index "IDX_46a672210083f21abc60d2866b"
	on ledger (name);

create table ledger_block
(
	id serial not null
		constraint "PK_9ef8ff10d2afad95b9c4372bf94"
			primary key,
	uid varchar not null,
	hash varchar not null,
	number integer not null,
	created_date timestamp not null,
	raw_data json not null,
	ledger_id integer not null
		constraint "FK_085937ae20813fa537bba543876"
			references ledger
);

alter table ledger_block owner to "hlf-explorer";

create unique index "IDX_e09f5beee9cf0207de8b4e516b"
	on ledger_block (uid, ledger_id);

create index "IDX_7a2d24d6c9581576d32f757eb1"
	on ledger_block (uid, hash, number, ledger_id);
        `;

        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {}
}
