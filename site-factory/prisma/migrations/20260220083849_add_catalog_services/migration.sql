-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `enable_adminer` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_elasticsearch` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_meilisearch` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_memcached` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_minio` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_rabbitmq` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `enable_varnish` BOOLEAN NOT NULL DEFAULT false;
