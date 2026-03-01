-- AlterTable
ALTER TABLE `wordpress_configs` ADD COLUMN `exclude_freemium` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `wp_features` TEXT NULL;
