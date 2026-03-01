-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `estimated_budget` INTEGER NULL,
    ADD COLUMN `maintenance_level` ENUM('STANDARD', 'ADVANCED', 'BUSINESS', 'CUSTOM') NULL,
    ADD COLUMN `modules` TEXT NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `category` ENUM('CAT1', 'CAT2', 'CAT3', 'CAT4') NULL;
