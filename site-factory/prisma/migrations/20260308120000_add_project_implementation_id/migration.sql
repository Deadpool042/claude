-- Add canonical implementation id to avoid enum lock-in
ALTER TABLE `projects`
  ADD COLUMN `project_implementation_id` VARCHAR(191) NULL;
