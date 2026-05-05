-- ProjectHub Database Dump
-- Compatible with MySQL/MariaDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `role` enum('SUPER_ADMIN','PROJECT_ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `status` enum('UNVERIFIED','ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'UNVERIFIED',
  `refresh_token` text DEFAULT NULL,
  `verify_email_token` text DEFAULT NULL,
  `verify_email_otp` varchar(10) DEFAULT NULL,
  `verify_email_expiry` datetime DEFAULT NULL,
  `forgot_password_otp` varchar(10) DEFAULT NULL,
  `forgot_password_expiry` datetime DEFAULT NULL,
  `last_login_date` datetime DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_status_idx` (`status`),
  KEY `users_deleted_at_idx` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `projects_created_by_idx` (`created_by`),
  KEY `projects_deleted_at_idx` (`deleted_at`),
  CONSTRAINT `projects_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for project_members
-- ----------------------------
DROP TABLE IF EXISTS `project_members`;
CREATE TABLE `project_members` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `role` enum('PROJECT_ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_members_project_id_user_id_key` (`project_id`,`user_id`),
  KEY `project_members_user_id_idx` (`user_id`),
  CONSTRAINT `project_members_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `project_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(10) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `deadline` date DEFAULT NULL,
  `assignee_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_project_id_idx` (`project_id`),
  KEY `tasks_assignee_id_idx` (`assignee_id`),
  KEY `tasks_status_idx` (`status`),
  KEY `tasks_deadline_idx` (`deadline`),
  KEY `tasks_deleted_at_idx` (`deleted_at`),
  KEY `tasks_created_by_fkey` (`created_by`),
  CONSTRAINT `tasks_assignee_id_fkey` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tasks_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `tasks_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for activity_logs
-- ----------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(10) unsigned DEFAULT NULL,
  `details` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `activity_logs_project_id_idx` (`project_id`),
  KEY `activity_logs_user_id_idx` (`user_id`),
  KEY `activity_logs_created_at_idx` (`created_at`),
  CONSTRAINT `activity_logs_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `activity_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
