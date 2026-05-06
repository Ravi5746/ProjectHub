import jwt from 'jsonwebtoken'
import { prisma } from '../config/connectDB.js'

// Refresh token: 7 days, stored in users table via Prisma
const generateRefreshToken = async (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    )

    // Update: delegating DB persistence to the calling controller to minimize roundtrips
    // await prisma.user.update({ ... })

    return token
}

export default generateRefreshToken
