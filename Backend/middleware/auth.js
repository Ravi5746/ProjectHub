import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers?.authorization?.split(' ')[1]

        if (!token) {
            console.warn(`[AUTH] No token provided for ${req.method} ${req.originalUrl}`)
            return res.status(401).json({
                message: 'Access token not provided',
                error: true,
                success: false
            })
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decoded) {
            return res.status(401).json({
                message: 'Unauthorized access',
                error: true,
                success: false
            })
        }

        req.userId = decoded.id
        req.userRole = decoded.role
        next()

    } catch (error) {
        console.error(`[AUTH] Token verification failed: ${error.message}`)
        return res.status(401).json({
            message: error.message || 'Invalid or expired token',
            error: true,
            success: false
        })
    }
}

export default auth
