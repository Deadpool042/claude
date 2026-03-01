-- CreateTable
CREATE TABLE `project_logs` (
    `id` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `env` VARCHAR(16) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `level` VARCHAR(16) NOT NULL,
    `service` VARCHAR(64) NULL,
    `source` VARCHAR(128) NOT NULL,
    `message` TEXT NOT NULL,
    `meta_json` TEXT NULL,
    `ts` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_logs_project_id_idx`(`project_id`),
    INDEX `project_logs_project_id_env_idx`(`project_id`, `env`),
    INDEX `project_logs_project_id_type_idx`(`project_id`, `type`),
    INDEX `project_logs_project_id_level_idx`(`project_id`, `level`),
    INDEX `project_logs_project_id_service_idx`(`project_id`, `service`),
    INDEX `project_logs_project_id_ts_idx`(`project_id`, `ts`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_logs` ADD CONSTRAINT `project_logs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
