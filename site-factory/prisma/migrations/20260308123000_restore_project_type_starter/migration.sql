-- Restore STARTER in ProjectType enum used by app validators/UI
ALTER TABLE `projects`
  MODIFY COLUMN `type` ENUM('STARTER','VITRINE','BLOG','ECOM','APP') NOT NULL DEFAULT 'VITRINE';
