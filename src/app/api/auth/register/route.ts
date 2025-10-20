import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// This endpoint is deprecated - use /api/auth/send-otp and /api/auth/verify-otp instead
export async function POST() {
  return NextResponse.json({
    error: 'This endpoint is deprecated. Please use /api/auth/send-otp to register.'
  }, { status: 410 })
}

