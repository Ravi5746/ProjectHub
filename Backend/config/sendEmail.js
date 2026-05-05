import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // STARTTLS — true only for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log('Sending email to:', to)
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html
        })
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Email error:', error)
        return { success: false, error: error.message }
    }
}

export default sendEmail
