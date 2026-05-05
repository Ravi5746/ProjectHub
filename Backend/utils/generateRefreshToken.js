import jwt from 'jsonwebtoken'
import { prisma } from '../config/connectDB.js'

// Refresh token: 7 days, stored in users table via Prisma
const generateRefreshToken = async (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    )

    await prisma.user.update({
        where: { id: Number(userId) },
        data: { refreshToken: token }
    })

    return token
}

export default generateRefreshToken
