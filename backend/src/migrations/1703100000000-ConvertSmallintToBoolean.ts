import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertSmallintToBoolean1703100000000 implements MigrationInterface {
  name = 'ConvertSmallintToBoolean1703100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if we're running on PostgreSQL
    const databaseType = queryRunner.connection.options.type;
    
    if (databaseType === 'postgres') {
      // Convert team.active from SMALLINT to BOOLEAN
      // First, check if the column exists and is SMALLINT
      const teamActiveColumn = await queryRunner.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team' AND column_name = 'active'
      `);
      
      if (teamActiveColumn.length > 0 && teamActiveColumn[0].data_type === 'smallint') {
        // Convert SMALLINT to BOOLEAN for team.active
        await queryRunner.query(`
          ALTER TABLE team 
          ALTER COLUMN active TYPE BOOLEAN 
          USING CASE 
            WHEN active = 1 THEN TRUE 
            WHEN active = 0 THEN FALSE 
            ELSE TRUE 
          END
        `);
        
        // Update default value to proper boolean
        await queryRunner.query(`
          ALTER TABLE team 
          ALTER COLUMN active SET DEFAULT TRUE
        `);
      }
      
      // Convert team_member.active from SMALLINT to BOOLEAN
      // First, check if the column exists and is SMALLINT
      const teamMemberActiveColumn = await queryRunner.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team_member' AND column_name = 'active'
      `);
      
      if (teamMemberActiveColumn.length > 0 && teamMemberActiveColumn[0].data_type === 'smallint') {
        // Convert SMALLINT to BOOLEAN for team_member.active
        await queryRunner.query(`
          ALTER TABLE team_member 
          ALTER COLUMN active TYPE BOOLEAN 
          USING CASE 
            WHEN active = 1 THEN TRUE 
            WHEN active = 0 THEN FALSE 
            ELSE TRUE 
          END
        `);
        
        // Update default value to proper boolean
        await queryRunner.query(`
          ALTER TABLE team_member 
          ALTER COLUMN active SET DEFAULT TRUE
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if we're running on PostgreSQL
    const databaseType = queryRunner.connection.options.type;
    
    if (databaseType === 'postgres') {
      // Revert team.active from BOOLEAN back to SMALLINT
      const teamActiveColumn = await queryRunner.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team' AND column_name = 'active'
      `);
      
      if (teamActiveColumn.length > 0 && teamActiveColumn[0].data_type === 'boolean') {
        // Convert BOOLEAN back to SMALLINT for team.active
        await queryRunner.query(`
          ALTER TABLE team 
          ALTER COLUMN active TYPE SMALLINT 
          USING CASE 
            WHEN active = TRUE THEN 1 
            WHEN active = FALSE THEN 0 
            ELSE 1 
          END
        `);
        
        // Update default value back to numeric
        await queryRunner.query(`
          ALTER TABLE team 
          ALTER COLUMN active SET DEFAULT 1
        `);
      }
      
      // Revert team_member.active from BOOLEAN back to SMALLINT
      const teamMemberActiveColumn = await queryRunner.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team_member' AND column_name = 'active'
      `);
      
      if (teamMemberActiveColumn.length > 0 && teamMemberActiveColumn[0].data_type === 'boolean') {
        // Convert BOOLEAN back to SMALLINT for team_member.active
        await queryRunner.query(`
          ALTER TABLE team_member 
          ALTER COLUMN active TYPE SMALLINT 
          USING CASE 
            WHEN active = TRUE THEN 1 
            WHEN active = FALSE THEN 0 
            ELSE 1 
          END
        `);
        
        // Update default value back to numeric
        await queryRunner.query(`
          ALTER TABLE team_member 
          ALTER COLUMN active SET DEFAULT 1
        `);
      }
    }
  }
}