import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })

    // Auto-create user if not exists
    if (!user) {
      console.log('[Credits API] User not found, auto-creating:', session.user.id)
      try {
        const userEmail = session.user.email || `user-${session.user.id}@app.local`
        
        // Check if email already exists
        const existingByEmail = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { credits: true }
        })

        if (existingByEmail) {
          console.log('[Credits API] Using existing user with same email')
          user = existingByEmail
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              id: session.user.id,
              email: userEmail,
              name: session.user.name || 'User',
              password: '',
              role: 'user',
              credits: 500
            },
            select: { credits: true }
          })
          console.log('[Credits API] ✅ User auto-created successfully')
        }
      } catch (createError) {
        console.error('[Credits API] ❌ Failed to auto-create user:', createError)
        return NextResponse.json(
          { error: 'User setup failed' },
          { status: 500 }
        )
      }
    }

    // Convert BigInt to Number for JSON serialization
    return NextResponse.json({ credits: Number(user.credits) })
  } catch (error) {
    console.error('[API] Get credits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}

