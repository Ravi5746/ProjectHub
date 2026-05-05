import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: true
})

// ─── CREATE TABLE SQL ─────────────────────────────────────────────────────────

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users (
    id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name                   VARCHAR(255) NOT NULL,
    email                  VARCHAR(255) NOT NULL,
    password               VARCHAR(255) NOT NULL,
    avatar                 VARCHAR(500) DEFAULT NULL,
    mobile                 VARCHAR(20)  DEFAULT NULL,
    role                   ENUM('SUPER_ADMIN','PROJECT_ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
    status                 ENUM('UNVERIFIED','ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'UNVERIFIED',
    refresh_token          TEXT         DEFAULT NULL,
    verify_email_token     TEXT         DEFAULT NULL,
    verify_email_expiry    DATETIME     DEFAULT NULL,
    forgot_password_otp    VARCHAR(10)  DEFAULT NULL,
    forgot_password_expiry DATETIME     DEFAULT NULL,
    last_login_date        DATETIME     DEFAULT NULL,
    created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at             DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const CREATE_PROJECTS = `
CREATE TABLE IF NOT EXISTS projects (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    description TEXT         DEFAULT NULL,
    status      ENUM('ACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_by  INT UNSIGNED NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_projects_created_by (created_by),
    INDEX idx_projects_deleted (deleted_at),
    CONSTRAINT fk_projects_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const CREATE_PROJECT_MEMBERS = `
CREATE TABLE IF NOT EXISTS project_members (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id  INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    role        ENUM('PROJECT_ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
    joined_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_project_user (project_id, user_id),
    INDEX idx_pm_user (user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const CREATE_TASKS = `
CREATE TABLE IF NOT EXISTS tasks (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id  INT UNSIGNED NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT         DEFAULT NULL,
    status      ENUM('TODO','IN_PROGRESS','DONE') NOT NULL DEFAULT 'TODO',
    priority    ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
    deadline    DATE         DEFAULT NULL,
    assignee_id INT UNSIGNED DEFAULT NULL,
    created_by  INT UNSIGNED NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_tasks_project  (project_id),
    INDEX idx_tasks_assignee (assignee_id),
    INDEX idx_tasks_status   (status),
    INDEX idx_tasks_deadline (deadline),
    INDEX idx_tasks_deleted  (deleted_at),
    CONSTRAINT fk_tasks_project  FOREIGN KEY (project_id)  REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users    (id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_creator  FOREIGN KEY (created_by)  REFERENCES users    (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const CREATE_ACTIVITY_LOGS = `
CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id  INT UNSIGNED NOT NULL,
    user_id     INT UNSIGNED NOT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50)  DEFAULT NULL,
    entity_id   INT UNSIGNED DEFAULT NULL,
    details     JSON         DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_al_project (project_id),
    INDEX idx_al_user    (user_id),
    INDEX idx_al_created (created_at),
    CONSTRAINT fk_al_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_al_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

// ─── DROP TABLE SQL (rollback) ────────────────────────────────────────────────

const DROP_ALL = `
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
`

// ─── RUN MIGRATION ────────────────────────────────────────────────────────────

async function runMigration() {
    const conn = await pool.getConnection()
    try {
        const isRollback = process.argv[2] === 'rollback'

        if (isRollback) {
            console.log('⚠️  Rolling back all tables...')
            await conn.query(DROP_ALL)
            console.log('✅ All tables dropped.')
        } else {
            console.log('🚀 Running migration: 001_initial_schema')
            await conn.query(CREATE_USERS)
            console.log('  ✅ Table: users')
            await conn.query(CREATE_PROJECTS)
            console.log('  ✅ Table: projects')
            await conn.query(CREATE_PROJECT_MEMBERS)
            console.log('  ✅ Table: project_members')
            await conn.query(CREATE_TASKS)
            console.log('  ✅ Table: tasks')
            await conn.query(CREATE_ACTIVITY_LOGS)
            console.log('  ✅ Table: activity_logs')
            console.log('🎉 Migration complete. Database: ProjectHub')
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        conn.release()
        await pool.end()
    }
}

runMigration()
