const verifyEmailTemplate = ({ name, otp }) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto;
                border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
                  padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ProjectHub</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0 0; font-size: 14px;">Project Management Platform</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for creating your ProjectHub account. Please verify your email
          address using the One-Time Password (OTP) below.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="background: #f3f4f6; color: #1f2937; padding: 20px;
                      border-radius: 12px; font-weight: bold; font-size: 32px;
                      display: inline-block; letter-spacing: 8px; border: 2px dashed #cbd5e1;">
            ${otp}
          </div>
        </div>
        <p style="color: #ef4444; font-size: 14px; text-align: center; font-weight: 500;">
          This OTP is valid for 24 hours.
        </p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2026 ProjectHub Inc. All rights reserved.
        </p>
      </div>
    </div>`
}

export default verifyEmailTemplate
