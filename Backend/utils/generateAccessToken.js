import jwt from 'jsonwebtoken'

// Access token: 15 minutes, contains id + role for RBAC
const generateAccessToken = (userId, role) => {
    const token = jwt.sign(
        { id: userId, role },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '15m' }
    )
    return token
}

export default generateAccessToken
