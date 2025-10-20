import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Cache session for 60 seconds to avoid repeated DB queries
let sessionCache: Map<string, { data: any, timestamp: number }> = new Map()
const CACHE_TTL = 60000 // 60 seconds

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check cache first
    const cacheKey = session.user.id
    const cached = sessionCache.get(cacheKey)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Single optimized query to get both API key and credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        geminiApiKey: true,
        credits: true,
        name: true,
        email: true,
        phone: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 🔒 Security: Mask sensitive data in response
    const maskEmail = (email: string) => {
      const [local, domain] = email.split('@')
      const maskedLocal = local.length > 3 
        ? local.slice(0, 3) + '*'.repeat(local.length - 3)
        : local.slice(0, 1) + '*'.repeat(local.length - 1)
      return `${maskedLocal}@${domain}`
    }

    const data = {
      user: {
        // 🔒 NEVER send API keys to client
        // geminiApiKey: REMOVED for security
        hasApiKey: !!user.geminiApiKey, // Only send boolean flag
        credits: Number(user.credits),
        name: user.name,
        email: maskEmail(user.email), // 🔒 Masked email
        phone: user.phone,
        role: user.role
      },
      // Keep backward compatibility (but secured)
      hasApiKey: !!user.geminiApiKey,
      credits: Number(user.credits),
      name: user.name,
      email: maskEmail(user.email), // 🔒 Masked email
      role: user.role
    }

    // Update cache
    sessionCache.set(cacheKey, { data, timestamp: now })

    // Clean old cache entries (simple cleanup)
    if (sessionCache.size > 100) {
      const entries = Array.from(sessionCache.entries())
      entries.forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_TTL) {
          sessionCache.delete(key)
        }
      })
    }

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// Invalidate cache when user updates
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      sessionCache.delete(session.user.id)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to invalidate cache' }, { status: 500 })
  }
}

