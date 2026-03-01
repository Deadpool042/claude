-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `db_type` ENUM('MARIADB', 'POSTGRESQL') NOT NULL DEFAULT 'MARIADB',
    ADD COLUMN `enable_db` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `enable_mailpit` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_phpmyadmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_redis` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `deploy_target` ENUM('DOCKER', 'VERCEL', 'SHARED_HOSTING') NOT NULL DEFAULT 'DOCKER';
