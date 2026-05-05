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

    if (process.env.DATABASE_URL || process.env.MYSQLHOST) {
        console.log('[connectDB] Initializing Prisma with MariaDB adapter')
        
        const config = process.env.DATABASE_URL 
            ? process.env.DATABASE_URL.replace('mysql://', 'mariadb://')
            : {
                host: process.env.MYSQLHOST,
                port: parseInt(process.env.MYSQLPORT || '3306'),
                user: process.env.MYSQLUSER,
                password: process.env.MYSQLPASSWORD,
                database: process.env.MYSQLDATABASE,
            };

        // Add connection limits to prevent exhaustion
        if (typeof config === 'string') {
            // Append parameters to connection string if it's a string
            const separator = config.includes('?') ? '&' : '?';
            poolInstance = mariadb.createPool(`${config}${separator}connectionLimit=5&acquireTimeout=10000`);
        } else {
            config.connectionLimit = 5;
            config.acquireTimeout = 10000;
            poolInstance = mariadb.createPool(config);
        }

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
