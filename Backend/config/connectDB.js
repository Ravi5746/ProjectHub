import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as mariadb from 'mariadb'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

let prismaInstance = null;
let poolInstance = null;

function createPrismaClient() {
    if (prismaInstance) return prismaInstance;

    if (process.env.MYSQLHOST || process.env.DATABASE_URL) {
        console.log('[connectDB] Initializing Prisma with MariaDB adapter')
        
        let config;
        if (process.env.MYSQLHOST) {
            console.log('[connectDB] Using private networking (MYSQLHOST)')
            config = {
                host: process.env.MYSQLHOST,
                port: parseInt(process.env.MYSQLPORT || '3306'),
                user: process.env.MYSQLUSER,
                password: process.env.MYSQLPASSWORD,
                database: process.env.MYSQLDATABASE,
                connectionLimit: 10,
                acquireTimeout: 30000,
            };
        } else {
            console.log('[connectDB] Using DATABASE_URL connection string')
            const dbUrl = process.env.DATABASE_URL.replace('mysql://', 'mariadb://')
            const separator = dbUrl.includes('?') ? '&' : '?';
            config = `${dbUrl}${separator}connectionLimit=10&acquireTimeout=30000`;
        }

        poolInstance = mariadb.createPool(config);
        const adapter = new PrismaMariaDb(poolInstance)
        prismaInstance = new PrismaClient({ adapter })
    } else {
        console.log('[connectDB] No DB environment variables found. Using Prisma native.')
        prismaInstance = new PrismaClient()
    }

    return prismaInstance
}

export const prisma = createPrismaClient()

async function connectDB() {
    try {
        console.log('[connectDB] Connecting to database...')
        await prisma.$connect()
        console.log('[connectDB] ✅ MySQL database connected via Prisma')
    } catch (error) {
        console.error('[connectDB] ❌ Prisma connection failed:', error.message)
        console.error('[connectDB] Stack Trace:', error.stack)
        throw error // Re-throw to make it a fatal error during startup
    }
}

export default connectDB
