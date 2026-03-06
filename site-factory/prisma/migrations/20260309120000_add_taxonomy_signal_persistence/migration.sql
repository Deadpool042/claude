-- Add dedicated persistence for taxonomy disambiguation signal
ALTER TABLE `project_qualifications`
  ADD COLUMN `taxonomy_signal` ENUM('SITE_VITRINE','SITE_BUSINESS','MVP_SAAS','APP_METIER') NULL;
