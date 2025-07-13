CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

-- Create sprint table
CREATE TABLE IF NOT EXISTS `sprint` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `capacity` INT NOT NULL DEFAULT 0,
  `projectedVelocity` INT NOT NULL DEFAULT 0,
  `completedVelocity` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Create team_member table
CREATE TABLE IF NOT EXISTS `team_member` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `skill` VARCHAR(45) NOT NULL,
  `updatedTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
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
INSERT INTO `team_member` (`name`, `skill`) VALUES
('Alice Johnson', 'Frontend'),
('Bob Smith', 'Backend'),
('Carol Davis', 'Fullstack'),
('David Wilson', 'Backend'),
('Emma Brown', 'Frontend');

INSERT INTO `sprint` (`name`, `startDate`, `endDate`, `capacity`, `projectedVelocity`, `completedVelocity`) VALUES
('Sprint 1', '2024-01-01', '2024-01-14', 50, 40, 35),
('Sprint 2', '2024-01-15', '2024-01-28', 48, 42, 40),
('Sprint 3', '2024-01-29', '2024-02-11', 52, 45, 38);

INSERT INTO `team_member_sprint_capacity` (`teamMemberId`, `sprintId`, `capacity`) VALUES
(1, 1, 10), (2, 1, 12), (3, 1, 14), (4, 1, 8), (5, 1, 6),
(1, 2, 9), (2, 2, 11), (3, 2, 13), (4, 2, 10), (5, 2, 5),
(1, 3, 11), (2, 3, 13), (3, 3, 12), (4, 3, 9), (5, 3, 7);