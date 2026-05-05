import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

// Singleton: reuse the same client across hot reloads in dev
const globalForPrisma = globalThis

function createPrismaClient() {
    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'ProjectHub',
    }

    console.log(`[connectDB] Initializing PrismaMariaDb with user: ${config.user}, database: ${config.database}`)

    try {
        const adapter = new PrismaMariaDb(config)
        console.log('[connectDB] Adapter created successfully')

        return new PrismaClient({
            adapter,
            log: ['query', 'info', 'warn', 'error'],
        })
    } catch (e) {
        console.error('[connectDB] ❌ Failed to create adapter:', e.message)
        throw e
    }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

async function connectDB() {
    try {
        console.log('[connectDB] Connecting to database...')
        await prisma.$connect()
        console.log('[connectDB] ✅ MySQL database connected via Prisma')
    } catch (error) {
        console.error('[connectDB] ❌ Prisma connection failed:', error.message)
        console.error('[connectDB] Stack Trace:', error.stack)
        // Don't exit immediately in dev, let nodemon retry if it's a transient issue
        // process.exit(1)
    }
}

export default connectDB
