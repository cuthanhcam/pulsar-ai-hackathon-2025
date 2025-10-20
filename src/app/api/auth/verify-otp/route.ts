import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, otp, password, name, phone } = await req.json()

    console.log('[Verify OTP] Request received for:', email)

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find OTP record
    console.log('[Verify OTP] Searching for OTP record...')
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      console.error('[Verify OTP] OTP not found or already used')
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP is expired (5 minutes)
    const now = new Date()
    if (now > otpRecord.expiresAt) {
      console.error('[Verify OTP] OTP expired')
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error('[Verify OTP] User already exists')
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate phone (optional but if provided, should be valid)
    if (phone && phone.length < 10) {
      return NextResponse.json(
        { error: 'Phone number must be at least 10 digits' },
        { status: 400 }
      )
    }

    // Hash password
    console.log('[Verify OTP] Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    console.log('[Verify OTP] Creating user...')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        phone: phone || null,
        role: 'user',
        credits: 500 // Default credits
      }
    })

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    })

    // Clean up old OTPs for this email
    await prisma.oTP.deleteMany({
      where: { email }
    })

    console.log('[Verify OTP] ✅ Success! User created:', user.email)

    return NextResponse.json({
      message: 'Account created successfully! Please login.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('[Verify OTP] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    )
  }
}

