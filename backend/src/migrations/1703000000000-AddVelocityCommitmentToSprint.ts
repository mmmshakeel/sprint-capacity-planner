import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVelocityCommitmentToSprint1703000000000 implements MigrationInterface {
  name = 'AddVelocityCommitmentToSprint1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'sprint',
      new TableColumn({
        name: 'velocityCommitment',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sprint', 'velocityCommitment');
  }
}