-- Add backend mode (app split/fullstack)
ALTER TABLE `project_qualifications`
  ADD COLUMN `backend_mode` ENUM('FULLSTACK','SEPARATE') NULL;
