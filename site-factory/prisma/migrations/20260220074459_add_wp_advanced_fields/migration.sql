-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `wp_default_pages` TEXT NULL,
    ADD COLUMN `wp_permalink_structure` VARCHAR(191) NULL DEFAULT '/%postname%/',
    ADD COLUMN `wp_plugins` TEXT NULL,
    ADD COLUMN `wp_theme` VARCHAR(191) NULL;
