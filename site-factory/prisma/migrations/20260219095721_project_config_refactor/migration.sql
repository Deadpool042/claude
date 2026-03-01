/*
  Warnings:

  - You are about to drop the column `jsonText` on the `project_configs` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `project_configs` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `project_configs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id]` on the table `project_configs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `project_id` to the `project_configs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `project_configs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `project_configs` DROP FOREIGN KEY `project_configs_projectId_fkey`;

-- DropIndex
DROP INDEX `project_configs_projectId_idx` ON `project_configs`;

-- AlterTable
ALTER TABLE `project_configs` DROP COLUMN `jsonText`,
    DROP COLUMN `projectId`,
    DROP COLUMN `version`,
    ADD COLUMN `db_name` VARCHAR(191) NULL,
    ADD COLUMN `db_password` VARCHAR(191) NULL,
    ADD COLUMN `db_user` VARCHAR(191) NULL,
    ADD COLUMN `db_version` VARCHAR(191) NOT NULL DEFAULT '11',
    ADD COLUMN `env_vars_json` TEXT NULL,
    ADD COLUMN `node_version` VARCHAR(191) NOT NULL DEFAULT '22',
    ADD COLUMN `php_version` VARCHAR(191) NOT NULL DEFAULT '8.3',
    ADD COLUMN `project_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `project_configs_project_id_key` ON `project_configs`(`project_id`);

-- AddForeignKey
ALTER TABLE `project_configs` ADD CONSTRAINT `project_configs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
