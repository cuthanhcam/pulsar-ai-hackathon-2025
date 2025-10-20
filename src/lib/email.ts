import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    // Check SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[Email] ❌ SMTP credentials not configured!')
      console.error('[Email] Missing:', {
        SMTP_USER: !process.env.SMTP_USER ? 'MISSING' : 'OK',
        SMTP_PASS: !process.env.SMTP_PASS ? 'MISSING' : 'OK',
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT || 'NOT SET'
      })
      return false
    }

    console.log('[Email] ✓ SMTP config loaded, attempting to send...')
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'PulsarTeam'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - PulsarTeam',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Verify Your Email</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              background-color: #09090b;
              color: #fafafa;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .email-wrapper {
              width: 100%;
              background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%);
              border: 2px solid #3f3f46;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              padding: 40px 32px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            }
            .logo-box {
              width: 80px;
              height: 80px;
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 20px;
              margin: 0 auto 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
              position: relative;
              z-index: 1;
            }
            .header h1 {
              color: #ffffff;
              font-size: 32px;
              font-weight: 900;
              margin: 0;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 48px 40px;
              text-align: center;
            }
            .greeting {
              font-size: 20px;
              font-weight: 700;
              color: #fafafa;
              margin-bottom: 12px;
            }
            .message {
              font-size: 16px;
              color: #a1a1aa;
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .message strong {
              color: #f97316;
              font-weight: 700;
            }
            .otp-container {
              background: linear-gradient(135deg, #27272a 0%, #3f3f46 100%);
              border: 3px solid #52525b;
              border-radius: 16px;
              padding: 32px;
              margin: 32px 0;
              position: relative;
            }
            .otp-container::before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              background: linear-gradient(135deg, #f97316, #ea580c, #f97316);
              border-radius: 16px;
              z-index: -1;
              opacity: 0.5;
              filter: blur(8px);
            }
            .otp-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #f97316;
              font-weight: 700;
              margin-bottom: 16px;
            }
            .otp-code {
              font-size: 48px;
              font-weight: 900;
              color: #ffffff;
              letter-spacing: 16px;
              font-family: 'Courier New', Courier, monospace;
              text-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
              margin: 16px 0;
            }
            .timer-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: rgba(249, 115, 22, 0.1);
              border: 2px solid rgba(249, 115, 22, 0.3);
              color: #f97316;
              padding: 12px 24px;
              border-radius: 100px;
              font-size: 14px;
              font-weight: 700;
              margin-top: 24px;
            }
            .instruction {
              background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
              border-left: 4px solid #f97316;
              padding: 20px 24px;
              border-radius: 12px;
              margin: 32px 0;
              text-align: left;
            }
            .instruction-title {
              font-size: 14px;
              font-weight: 700;
              color: #fafafa;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .instruction-text {
              font-size: 14px;
              color: #a1a1aa;
              line-height: 1.8;
            }
            .security-notice {
              background: linear-gradient(135deg, #7c2d12 0%, #431407 100%);
              border: 2px solid #ea580c;
              border-radius: 12px;
              padding: 20px 24px;
              margin: 32px 0;
              text-align: left;
            }
            .security-notice-title {
              font-size: 14px;
              font-weight: 700;
              color: #fed7aa;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .security-notice-text {
              font-size: 13px;
              color: #fdba74;
              line-height: 1.8;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, #3f3f46 50%, transparent 100%);
              margin: 32px 0;
            }
            .footer {
              padding: 32px 40px;
              background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
              border-top: 1px solid #27272a;
              text-align: center;
            }
            .footer-text {
              font-size: 13px;
              color: #71717a;
              line-height: 1.6;
              margin-bottom: 8px;
            }
            .footer-brand {
              font-size: 12px;
              color: #52525b;
              font-weight: 600;
              margin-top: 16px;
            }
            .footer-brand .brand-name {
              background: linear-gradient(135deg, #f97316, #ea580c);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 800;
            }
            @media only screen and (max-width: 600px) {
              .email-wrapper {
                padding: 20px 10px;
              }
              .content {
                padding: 32px 24px;
              }
              .otp-code {
                font-size: 36px;
                letter-spacing: 12px;
              }
              .header h1 {
                font-size: 24px;
              }
              .header {
                padding: 32px 24px;
              }
              .footer {
                padding: 24px 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <!-- Header -->
              <div class="header">
                <div class="logo-box">✨</div>
                <h1>Email Verification</h1>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">Hi ${name || 'there'}! 👋</div>
                <div class="message">
                  Welcome to <strong>PulsarTeam</strong>! We're excited to have you on board.
                  <br>To complete your registration, please verify your email address.
                </div>

                <!-- OTP Box -->
                <div class="otp-container">
                  <div class="otp-label">Your Verification Code</div>
                  <div class="otp-code">${otp}</div>
                  <div class="timer-badge">
                    <span style="font-size: 16px;">⏱️</span>
                    <span>Valid for 5 minutes</span>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="instruction">
                  <div class="instruction-title">
                    <span style="font-size: 16px;">📝</span>
                    <span>How to use this code:</span>
                  </div>
                  <div class="instruction-text">
                    1. Return to the verification page<br>
                    2. Enter the 6-digit code above<br>
                    3. Click "Verify & Create Account"<br>
                    4. Start your learning journey!
                  </div>
                </div>

                <!-- Security Notice -->
                <div class="security-notice">
                  <div class="security-notice-title">
                    <span style="font-size: 16px;">🔒</span>
                    <span>Security Notice</span>
                  </div>
                  <div class="security-notice-text">
                    • Never share this code with anyone<br>
                    • PulsarTeam will never ask for your OTP via phone or email<br>
                    • This code expires in 5 minutes for your security
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="footer-text">
                  If you didn't request this verification code, you can safely ignore this email.<br>
                  No account will be created without verifying this code.
                </div>
                <div class="divider"></div>
                <div class="footer-brand">
                  © 2025 <span class="brand-name">PulsarTeam</span>. All rights reserved.<br>
                  Empowering learners with AI-powered education.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('[Email] ✅ OTP email sent successfully to:', email)
    return true
  } catch (error) {
    console.error('[Email] ❌ Error sending OTP email:', error)
    if (error instanceof Error) {
      console.error('[Email] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      })
    }
    return false
  }
}

// Verify transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    return false
  }
}
