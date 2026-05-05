import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import connectDB from './config/connectDB.js'
import requestId from './middleware/requestId.js'
import errorHandler from './middleware/errorHandler.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import projectRouter from './routes/project.routes.js'
import taskRouter from './routes/task.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'



const app = express()

// ─── MIDDLEWARE ORDER (per architecture) ──────────────────────────────────────
// 1. Request ID
app.use(requestId)

// 2. CORS
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://loving-peace-frontend.up.railway.app'
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,                // 100 requests per window per IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many requests, please try again later.',
        error: true,
        success: false
    }
})
app.use(limiter)

// Stricter limit on auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        message: 'Too many auth attempts, please try again later.',
        error: true,
        success: false
    }
})

// 4. Body parsing + Cookies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 5. Security headers
app.use(helmet())

// 6. HTTP request logging
app.use(morgan('dev'))

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
    res.json({
        message: 'ProjectHub API is running',
        error: false,
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    })
})

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/projects', projectRouter)
app.use('/api/v1/tasks', taskRouter)
app.use('/api/v1/dashboard', dashboardRouter)

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: true,
        success: false
    })
})

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler)

// ─── EXPORT FOR VERCEL ────────────────────────────────────────────────────────
export default app

// ─── START SERVER (Local/Railway only) ────────────────────────────────────────
const PORT = process.env.PORT || 8080

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 ProjectHub API server running on port: ${PORT}`)
            console.log(`   Health: http://localhost:${PORT}/api/v1/health`)
        })
    }).catch(err => {
        console.error("Failed to connect to DB:", err)
    })
}

