import { Router } from 'express'
import {
    signupController,
    verifyEmailController,
    resendVerifyEmailController,
    loginController,
    logoutController,
    refreshTokenController,
    forgotPasswordController,
    verifyForgotPasswordOtpController,
    resetPasswordController
} from '../controllers/auth.controller.js'
import auth from '../middleware/auth.js'

const authRouter = Router()

authRouter.post('/signup', signupController)
authRouter.post('/verify-email', verifyEmailController)
authRouter.post('/resend-verify-email', resendVerifyEmailController)
authRouter.post('/login', loginController)
authRouter.get('/logout', auth, logoutController)
authRouter.post('/refresh-token', refreshTokenController)
authRouter.put('/forgot-password', forgotPasswordController)
authRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtpController)
authRouter.put('/reset-password', resetPasswordController)

export default authRouter
