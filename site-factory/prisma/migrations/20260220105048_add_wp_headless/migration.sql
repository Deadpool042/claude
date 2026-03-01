-- AlterTable
ALTER TABLE `project_configs` ADD COLUMN `frontend_stack` ENUM('NEXTJS', 'NUXT', 'ASTRO') NULL,
    ADD COLUMN `wp_headless` BOOLEAN NOT NULL DEFAULT false;
