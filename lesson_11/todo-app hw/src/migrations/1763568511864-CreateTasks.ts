import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasks1763568511864 implements MigrationInterface {
    name = 'CreateTasks1763568511864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607de52438268ab19a40634942"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "ownerId" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("ownerId", "completed") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bc913ba3ebec322f9f278ccf10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607de52438268ab19a40634942"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "ownerId" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_607de52438268ab19a40634942" ON "tasks" ("ownerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bc913ba3ebec322f9f278ccf10" ON "tasks" ("completed", "ownerId") `);
    }

}
