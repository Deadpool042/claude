-- AlterTable
ALTER TABLE `clients` ADD COLUMN `website` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `git_repo` VARCHAR(191) NULL,
    ADD COLUMN `tech_stack` VARCHAR(191) NULL;
