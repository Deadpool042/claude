-- Add qualification constraints + CI fields
ALTER TABLE `project_qualifications`
  ADD COLUMN `traffic_level` ENUM('LOW','MEDIUM','HIGH','VERY_HIGH') NULL,
  ADD COLUMN `product_count` ENUM('NONE','SMALL','MEDIUM','LARGE') NULL,
  ADD COLUMN `data_sensitivity` ENUM('STANDARD','SENSITIVE','REGULATED') NULL,
  ADD COLUMN `scalability_level` ENUM('FIXED','GROWING','ELASTIC') NULL,
  ADD COLUMN `needs_editing` BOOLEAN NULL,
  ADD COLUMN `editing_frequency` ENUM('RARE','REGULAR','DAILY') NULL,
  ADD COLUMN `headless_required` BOOLEAN NULL,
  ADD COLUMN `commerce_model` ENUM('SAAS','SELF_HOSTED','HEADLESS') NULL,
  ADD COLUMN `ci_score` DOUBLE NULL,
  ADD COLUMN `ci_category` ENUM('CAT0','CAT1','CAT2','CAT3','CAT4') NULL,
  ADD COLUMN `ci_axes_json` TEXT NULL;

-- Update maintenance enum to v2 (CUSTOM -> PREMIUM)
UPDATE `project_qualifications`
  SET `maintenance_level` = 'PREMIUM'
  WHERE `maintenance_level` = 'CUSTOM';

ALTER TABLE `project_qualifications`
  MODIFY `maintenance_level` ENUM('MINIMAL','STANDARD','ADVANCED','BUSINESS','PREMIUM') NULL;
