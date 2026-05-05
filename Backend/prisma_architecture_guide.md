# Modern Backend Architecture: From Raw SQL to Prisma ORM (v7.8.0)

This guide walks you through the structural changes, logic, and concepts behind migrating a Node/Express backend from raw MySQL queries to a modern, type-safe Prisma architecture.

---

## 1. The Core Philosophy: Single Source of Truth

In traditional SQL-based Node applications, developers often create a `models/` directory filled with constants, manual SQL table creation scripts, or Sequelize schemas. 

**With Prisma, the entire database architecture is centralized in one file:**
`prisma/schema.prisma`

This file is the "Single Source of Truth." Prisma reads this file to:
1. Generate the database tables (via `prisma migrate dev`).
2. Generate a highly typed JavaScript/TypeScript client (`@prisma/client`).
3. Handle enums, relationships, and constraints.

Because of this, the traditional `models/` directory becomes obsolete. Any remaining business logic or constants from those files (like `TASK_STATUS` or `ALLOWED_TRANSITIONS`) should be extracted into a `constants/` folder to keep the architecture clean.

---

## 2. Setting Up Prisma 7 (The Modern Way)

Prisma 7 introduced a major shift in how configurations and connections are handled.

### A. The Configuration File (`prisma.config.js`)
Previously, the database connection URL was hardcoded in `schema.prisma`. In Prisma 7, the `url` property in `schema.prisma` is deprecated. Instead, you define a centralized config file:

```javascript
// prisma.config.js
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'), // Reads from .env securely
  },
})
```

### B. The Schema (`schema.prisma`)
The schema now only defines the provider and your data models. Note the use of `@@map` to map camelCase Prisma fields to snake_case database columns.

```prisma
datasource db {
  provider = "mysql"
}

model User {
  id             Int       @id @default(autoincrement())
  name           String    @db.VarChar(255)
  email          String    @unique @db.VarChar(255)
  password       String    @db.VarChar(255)
  role           UserRole  @default(MEMBER)
  
  // Maps the camelCase property to the underlying snake_case column
  refreshToken   String?   @map("refresh_token") @db.Text
  createdAt      DateTime  @default(now()) @map("created_at")

  @@map("users") // Maps the model to the "users" table
}
```

---

## 3. The Singleton Connection (`config/connectDB.js`)

In development, frameworks like nodemon (or Next.js) constantly restart the server. If you create a `new PrismaClient()` every time the server restarts, you will exhaust the database connection pool. 

To solve this, we use the **Singleton Pattern**, ensuring only *one* instance of Prisma Client is ever running.

Additionally, Prisma 7 highly encourages **Driver Adapters** for better performance and serverless compatibility. We use the `@prisma/adapter-mariadb` (which supports MySQL natively).

```javascript
// config/connectDB.js
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

// Attach the client to the global object in development
const globalForPrisma = globalThis

const connectionString = process.env.DATABASE_URL

let adapter
if (connectionString) {
    // Create an efficient connection pool using the native driver
    const pool = mariadb.createPool(connectionString)
    adapter = new PrismaMariaDb(pool)
}

// Instantiate the Prisma Client with the adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error']
})

// Prevent multiple instances during hot-reloads
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
```

---

## 4. Refactoring the Repository Layer

The Repository layer is responsible for direct database interactions. With raw SQL, you had to manually format strings, handle joins, and parse results. Prisma makes this type-safe and incredibly simple.

### Before (Raw SQL):
```javascript
export async function findUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    return rows[0];
}
```

### After (Prisma):
```javascript
import { prisma } from '../config/connectDB.js'

export async function findUserByEmail(email) {
    return await prisma.user.findUnique({
        where: { 
            email: email,
            deletedAt: null // Prisma handles the soft-delete filter natively
        }
    })
}
```

### Handling Relationships (Joins)
Prisma replaces complex SQL `JOIN` statements with the `include` property.

```javascript
// Fetch a project and include its members
const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
        members: {
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        }
    }
})
```

---

## 5. Controller Alignment (camelCase vs snake_case)

A major paradigm shift when moving to Prisma is property naming. 
* **Database Columns:** Standard SQL uses `snake_case` (e.g., `refresh_token`).
* **JavaScript Objects:** Standard JS uses `camelCase` (e.g., `refreshToken`).

Because of the `@@map("refresh_token")` directive in `schema.prisma`, Prisma automatically translates the database rows into beautiful `camelCase` JavaScript objects.

**This means controllers must be updated to expect camelCase.**

```javascript
// BEFORE:
const token = user.refresh_token;
const created = user.created_at;

// AFTER:
const token = user.refreshToken;
const created = user.createdAt;
```

---

## 6. Summary of Architecture Workflow

1. **Modify Schema:** You make structural changes in `prisma/schema.prisma`.
2. **Migrate:** Run `npx prisma migrate dev --name <migration_name>`. This pushes the SQL to the database.
3. **Generate:** Prisma automatically runs `npx prisma generate` to update the `@prisma/client` types.
4. **Interact:** You use the `prisma` singleton in your `repositories/` to perform CRUD operations.
5. **Serve:** Your controllers handle the HTTP requests, utilizing the cleanly formatted camelCase data returned by the repositories.

By following this architecture, the backend achieves maximum maintainability, security against SQL injection, and robust type-safety across the entire stack.
