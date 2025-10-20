import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTPEmail } from '@/lib/email'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Delete all previous OTPs for this email
    await prisma.oTP.deleteMany({
      where: { email }
    })

    // Generate new 6-digit OTP
    const otpCode = generateOTP()

    // Calculate expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Save new OTP to database
    await prisma.oTP.create({
      data: {
        email,
        code: otpCode,
        expiresAt,
        verified: false
      }
    })

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otpCode, name)

    if (!emailSent) {
      // Clean up the OTP if email failed to send
      await prisma.oTP.deleteMany({
        where: { email }
      })
      
      return NextResponse.json(
        { error: 'Failed to resend OTP email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'New OTP sent successfully to your email',
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    )
  }
}

