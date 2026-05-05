import jwt from 'jsonwebtoken'

const auth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
        const origin = req.get('origin')

        if (!token) {
            console.warn(`[AUTH] No token found for ${req.method} ${req.originalUrl} (Origin: ${origin})`)
            console.log(`[AUTH] Cookies received: ${Object.keys(req.cookies || {}).join(', ') || 'NONE'}`)
            return res.status(401).json({
                message: "Please login to continue",
                error: true,
                success: false
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decode) {
            return res.status(401).json({
                message: "Unauthorized access",
                error: true,
                success: false
            })
        }

        req.userId = decode.id
        req.userRole = decode.role

        next()

    } catch (error) {
        console.error(`[AUTH] Error: ${error.message}`)
        return res.status(401).json({
            message: error.message || "Invalid or expired token",
            error: true,
            success: false
        })
    }
}

export default auth
