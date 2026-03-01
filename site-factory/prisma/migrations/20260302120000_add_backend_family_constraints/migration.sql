-- Add backend constraints for App Custom
ALTER TABLE `project_qualifications`
  ADD COLUMN `backend_family` ENUM('BAAS_STANDARD','BAAS_ADVANCED','CUSTOM_API') NULL,
  ADD COLUMN `backend_ops_heavy` BOOLEAN NULL;
