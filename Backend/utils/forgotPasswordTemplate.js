const forgotPasswordTemplate = ({ name, otp }) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto;
                border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
                  padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ProjectHub</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">Project Management Platform</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Dear ${name},<br/><br/>
          You have requested a password reset. Please use the following OTP code to reset your password.
        </p>
        <div style="background-color: #eff6ff; border: 2px solid #2563eb; font-size: 32px;
                    font-weight: bold; padding: 16px; text-align: center; margin: 20px 0;
                    border-radius: 8px; letter-spacing: 8px; color: #1e3a5f;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 13px;">
          This OTP is valid for <strong>1 hour</strong>. Do not share it with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you did not request a password reset, please ignore this email.
          Your password will not change until you use the OTP above.
        </p>
      </div>
    </div>`
}

export default forgotPasswordTemplate
