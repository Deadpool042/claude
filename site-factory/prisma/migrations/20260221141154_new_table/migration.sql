/*
  Warnings:

  - You are about to drop the column `port` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `project_configs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `project_configs` DROP FOREIGN KEY `project_configs_project_id_fkey`;

-- AlterTable
ALTER TABLE `projects` DROP COLUMN `port`,
    MODIFY `tech_stack` ENUM('WORDPRESS', 'NEXTJS', 'NUXT', 'ASTRO') NULL;

-- DropTable
DROP TABLE `project_configs`;

-- CreateTable
CREATE TABLE `project_runtimes` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `port` INTEGER NULL,
    `local_host` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_runtimes_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_databases` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `db_type` ENUM('MARIADB', 'POSTGRESQL') NOT NULL DEFAULT 'MARIADB',
    `db_version` VARCHAR(191) NOT NULL DEFAULT '11',
    `db_name` VARCHAR(191) NULL,
    `db_user` VARCHAR(191) NULL,
    `db_password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_databases_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_services` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `service_id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `options_json` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `project_services_project_id_idx`(`project_id`),
    UNIQUE INDEX `project_services_project_id_service_id_key`(`project_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wordpress_configs` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `php_version` VARCHAR(191) NOT NULL DEFAULT '8.3',
    `wp_headless` BOOLEAN NOT NULL DEFAULT false,
    `frontend_stack` ENUM('NEXTJS', 'NUXT', 'ASTRO') NULL,
    `wp_site_title` VARCHAR(191) NULL,
    `wp_admin_user` VARCHAR(191) NULL,
    `wp_admin_password` VARCHAR(191) NULL,
    `wp_admin_email` VARCHAR(191) NULL,
    `wp_permalink_structure` VARCHAR(191) NULL DEFAULT '/%postname%/',
    `wp_default_pages` TEXT NULL,
    `wp_plugins` TEXT NULL,
    `wp_theme` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wordpress_configs_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nextjs_configs` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `node_version` VARCHAR(191) NOT NULL DEFAULT '22',
    `env_vars_json` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nextjs_configs_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_qualifications` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `modules` TEXT NULL,
    `maintenance_level` ENUM('STANDARD', 'ADVANCED', 'BUSINESS', 'CUSTOM') NULL,
    `estimated_budget` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_qualifications_project_id_key`(`project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_runtimes` ADD CONSTRAINT `project_runtimes_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_databases` ADD CONSTRAINT `project_databases_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_services` ADD CONSTRAINT `project_services_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wordpress_configs` ADD CONSTRAINT `wordpress_configs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nextjs_configs` ADD CONSTRAINT `nextjs_configs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_qualifications` ADD CONSTRAINT `project_qualifications_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
