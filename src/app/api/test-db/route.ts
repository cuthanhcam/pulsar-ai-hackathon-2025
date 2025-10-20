import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[Test DB] Testing database connection...')
    console.log('[Test DB] DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('[Test DB] NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
    
    // Test connection
    await prisma.$connect()
    console.log('[Test DB] ✅ Connected to database')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log('[Test DB] ✅ Query successful. User count:', userCount)
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'truongminh0949@gmail.com' },
      select: { id: true, email: true, name: true, role: true }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        adminExists: !!admin,
        adminData: admin,
        env: {
          DATABASE_URL: !!process.env.DATABASE_URL,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL
        }
      }
    })
  } catch (error) {
    console.error('[Test DB] ❌ Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      }
    }, { status: 500 })
  }
}

