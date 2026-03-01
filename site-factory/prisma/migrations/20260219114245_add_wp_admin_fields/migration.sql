-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `wp_admin_email` VARCHAR(191) NULL,
    ADD COLUMN `wp_admin_password` VARCHAR(191) NULL,
    ADD COLUMN `wp_admin_user` VARCHAR(191) NULL,
    ADD COLUMN `wp_site_title` VARCHAR(191) NULL;
