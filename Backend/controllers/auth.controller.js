import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmail from '../config/sendEmail.js'
import { findUserByEmail, findUserById, createUser, updateUserById } from '../repositories/user.repository.js'
import { validatePassword } from '../utils/passwordValidator.js'
import generateAccessToken from '../utils/generateAccessToken.js'
import generateRefreshToken from '../utils/generateRefreshToken.js'
import generateOtp from '../utils/generateOtp.js'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export async function signupController(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please provide name, email and password',
                error: true,
                success: false
            })
        }

        const pwCheck = validatePassword(password)
        if (!pwCheck.isValid) {
            return res.status(400).json({
                message: 'Password does not meet requirements',
                errors: pwCheck.errors,
                error: true,
                success: false
            })
        }

        const existingUser = await findUserByEmail(email)
        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered',
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(12)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const otp = generateOtp()
        const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

        const newUser = await createUser({
            name,
            email,
            password: hashedPassword,
            verifyEmailExpiry: verifyExpiry
        })

        // Save OTP to database
        await updateUserById(newUser.id, { verifyEmailOtp: String(otp) })

        await sendEmail({
            to: email,
            subject: 'Verify your email — ShopVerse',
            html: verifyEmailTemplate({ name, otp })
        })

        return res.status(201).json({
            message: 'Account created successfully. Please enter the OTP sent to your email.',
            error: false,
            success: true,
            data: { email: newUser.email, name: newUser.name }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
export async function verifyEmailController(req, res) {
    try {
        const { otp, email } = req.body

        if (!otp || !email) {
            return res.status(400).json({
                message: 'OTP and email are required',
                error: true,
                success: false
            })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        if (user.status === 'ACTIVE') {
            return res.json({
                message: 'Email already verified. You can log in.',
                error: false,
                success: true
            })
        }

        if (!user.verifyEmailExpiry || new Date() > new Date(user.verifyEmailExpiry)) {
            return res.status(400).json({
                message: 'OTP has expired. Please request a new one.',
                error: true,
                success: false
            })
        }

        if (String(otp) !== user.verifyEmailOtp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                error: true,
                success: false
            })
        }

        await updateUserById(user.id, {
            status: 'ACTIVE',
            verifyEmailOtp: null,
            verifyEmailExpiry: null
        })

        return res.json({
            message: 'Email verified successfully! You can now log in.',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── RESEND VERIFY EMAIL ──────────────────────────────────────────────────────
export async function resendVerifyEmailController(req, res) {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: 'Email is required',
                error: true,
                success: false
            })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            // Don't reveal whether email exists (prevent user enumeration)
            return res.json({
                message: 'If this email is registered, a verification link has been sent.',
                error: false,
                success: true
            })
        }

        if (user.status === 'ACTIVE') {
            return res.json({
                message: 'Email is already verified. You can log in.',
                error: false,
                success: true
            })
        }

        // Rate limit: don't allow resend if last email < 2 minutes ago
        if (user.verifyEmailExpiry) {
            const tokenAge = Date.now() - (new Date(user.verifyEmailExpiry).getTime() - 24 * 60 * 60 * 1000)
            if (tokenAge < 2 * 60 * 1000) {
                return res.status(429).json({
                    message: 'Please wait at least 2 minutes before requesting another email.',
                    error: true,
                    success: false
                })
            }
        }

        const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const otp = generateOtp()

        await updateUserById(user.id, {
            verifyEmailExpiry: verifyExpiry,
            verifyEmailOtp: String(otp)
        })

        await sendEmail({
            to: email,
            subject: 'Verify your email — ShopVerse',
            html: verifyEmailTemplate({ name: user.name, otp })
        })

        return res.json({
            message: 'If this email is registered, a new OTP has been sent.',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function loginController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required',
                error: true,
                success: false
            })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or password',
                error: true,
                success: false
            })
        }

        if (user.status === 'UNVERIFIED') {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox.',
                error: true,
                success: false,
                isEmailNotVerified: true,
                email: user.email
            })
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                message: 'Your account has been suspended. Please contact admin.',
                error: true,
                success: false
            })
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'Invalid email or password',
                error: true,
                success: false
            })
        }

        const accessToken = generateAccessToken(user.id, user.role)
        const refreshToken = await generateRefreshToken(user.id)

        // Combined update for efficiency
        await updateUserById(user.id, { 
            lastLoginDate: new Date(),
            refreshToken: refreshToken // Already done in generateRefreshToken but doing it here is fine if I modify generateRefreshToken
        })

        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        }

        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })       // 15 min
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt
        }

        return res.json({
            message: 'Login successful',
            error: false,
            success: true,
            data: {
                accessToken,
                ...userData
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logoutController(req, res) {
    try {
        const userId = req.userId

        await updateUserById(userId, { refreshToken: null })

        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        }

        res.clearCookie('accessToken', cookieOptions)
        res.clearCookie('refreshToken', cookieOptions)

        return res.json({
            message: 'Logged out successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
export async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken || req.headers?.authorization?.split(' ')[1]

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token not provided',
                error: true,
                success: false
            })
        }

        let decoded
        try {
            decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        } catch (err) {
            return res.status(401).json({
                message: 'Invalid or expired refresh token',
                error: true,
                success: false
            })
        }

        const user = await findUserById(decoded.id)
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: 'Refresh token is invalid or has been revoked',
                error: true,
                success: false
            })
        }

        // Rotate: issue new access + refresh tokens
        const newAccessToken = generateAccessToken(user.id, user.role)
        const newRefreshToken = await generateRefreshToken(user.id)

        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax'
        }

        res.cookie('accessToken', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })

        return res.json({
            message: 'Tokens refreshed successfully',
            error: false,
            success: true,
            data: { accessToken: newAccessToken }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: 'Email is required',
                error: true,
                success: false
            })
        }

        // Always respond the same regardless of whether email exists (prevent enumeration)
        const user = await findUserByEmail(email)
        if (user) {
            const otp = generateOtp()
            const expireTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

            await updateUserById(user.id, {
                forgotPasswordOtp: String(otp),
                forgotPasswordExpiry: expireTime
            })

            await sendEmail({
                to: email,
                subject: 'Password Reset OTP — ProjectHub',
                html: forgotPasswordTemplate({ name: user.name, otp })
            })
        }

        return res.json({
            message: 'If this email is registered, you will receive an OTP shortly.',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── VERIFY FORGOT PASSWORD OTP ───────────────────────────────────────────────
export async function verifyForgotPasswordOtpController(req, res) {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required',
                error: true,
                success: false
            })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email or OTP',
                error: true,
                success: false
            })
        }

        if (!user.forgotPasswordExpiry || new Date() > new Date(user.forgotPasswordExpiry)) {
            return res.status(400).json({
                message: 'OTP has expired. Please request a new one.',
                error: true,
                success: false
            })
        }

        if (String(otp) !== user.forgotPasswordOtp) {
            return res.status(400).json({
                message: 'Invalid OTP',
                error: true,
                success: false
            })
        }

        await updateUserById(user.id, {
            forgotPasswordOtp: null,
            forgotPasswordExpiry: null
        })

        return res.json({
            message: 'OTP verified successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export async function resetPasswordController(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: 'Email, new password and confirm password are required',
                error: true,
                success: false
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match',
                error: true,
                success: false
            })
        }

        const pwCheck = validatePassword(newPassword)
        if (!pwCheck.isValid) {
            return res.status(400).json({
                message: 'Password does not meet requirements',
                errors: pwCheck.errors,
                error: true,
                success: false
            })
        }

        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({
                message: 'Invalid email',
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(12)
        const hashedPassword = await bcryptjs.hash(newPassword, salt)

        // Invalidate all existing sessions
        await updateUserById(user.id, {
            password: hashedPassword,
            refreshToken: null
        })

        return res.json({
            message: 'Password reset successfully. Please log in with your new password.',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
