CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

-- Create team table
CREATE TABLE IF NOT EXISTS `team` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Create sprint table
CREATE TABLE IF NOT EXISTS `sprint` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `capacity` INT NOT NULL DEFAULT 0,
  `projectedVelocity` INT NOT NULL DEFAULT 0,
  `completedVelocity` INT NOT NULL DEFAULT 0,
  `teamId` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_sprint_team_idx` (`teamId` ASC),
  CONSTRAINT `fk_sprint_team`
    FOREIGN KEY (`teamId`)
    REFERENCES `team` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- Create team_member table
CREATE TABLE IF NOT EXISTS `team_member` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `skill` VARCHAR(45) NOT NULL,
  `updatedTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` TINYINT NOT NULL DEFAULT 1,
  `teamId` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `fk_team_member_team_idx` (`teamId` ASC),
  CONSTRAINT `fk_team_member_team`
    FOREIGN KEY (`teamId`)
    REFERENCES `team` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- Create team_member_sprint_capacity table
CREATE TABLE IF NOT EXISTS `team_member_sprint_capacity` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teamMemberId` INT NOT NULL,
  `sprintId` INT NOT NULL,
  `capacity` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `sprint_id_idx` (`sprintId` ASC),
  INDEX `team_member_id_idx` (`teamMemberId` ASC),
  CONSTRAINT `fk_sprint_id`
    FOREIGN KEY (`sprintId`)
    REFERENCES `sprint` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_team_member_id`
    FOREIGN KEY (`teamMemberId`)
    REFERENCES `team_member` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- Insert sample data
-- Insert sample teams
INSERT INTO `team` (`name`, `description`) VALUES
('Frontend Team', 'Team responsible for frontend development'),
('Backend Team', 'Team responsible for backend development'),
('Platform Team', 'Team responsible for platform and infrastructure');

-- Insert sample team members with team assignments
INSERT INTO `team_member` (`name`, `skill`, `teamId`) VALUES
('Alice Johnson', 'Frontend', 1),
('Bob Smith', 'Backend', 2),
('Carol Davis', 'Fullstack', 3),
('David Wilson', 'Backend', 2),
('Emma Brown', 'Frontend', 1);

-- Insert sample sprints with team assignments
INSERT INTO `sprint` (`name`, `startDate`, `endDate`, `capacity`, `projectedVelocity`, `completedVelocity`, `teamId`) VALUES
('Frontend Sprint 1', '2024-01-01', '2024-01-14', 50, 40, 35, 1),
('Backend Sprint 1', '2024-01-01', '2024-01-14', 48, 42, 40, 2),
('Platform Sprint 1', '2024-01-15', '2024-01-28', 52, 45, 38, 3);

-- Insert team member capacity assignments
INSERT INTO `team_member_sprint_capacity` (`teamMemberId`, `sprintId`, `capacity`) VALUES
-- Frontend Sprint 1 (Alice, Emma from Frontend Team)
(1, 1, 10), (5, 1, 6),
-- Backend Sprint 1 (Bob, David from Backend Team)
(2, 2, 12), (4, 2, 8),
-- Platform Sprint 1 (Carol from Platform Team)
(3, 3, 14);