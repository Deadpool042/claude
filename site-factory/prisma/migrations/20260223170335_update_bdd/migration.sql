-- AlterTable
ALTER TABLE `projects` ADD COLUMN `hosting_provider_id` VARCHAR(191) NULL,
    MODIFY `type` ENUM('STARTER', 'VITRINE', 'BLOG', 'ECOM', 'APP') NOT NULL DEFAULT 'VITRINE',
    MODIFY `category` ENUM('CAT0', 'CAT1', 'CAT2', 'CAT3', 'CAT4') NULL;

-- AlterTable
ALTER TABLE `wordpress_configs` ADD COLUMN `custom_caps_json` TEXT NULL;
