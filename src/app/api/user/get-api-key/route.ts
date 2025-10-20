import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get user's API key
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true }
    })

    // 🔒 Security: Mask API key in response (show only first 8 and last 4 chars)
    const maskApiKey = (key: string | null) => {
      if (!key) return null
      if (key.length <= 12) return '*'.repeat(key.length)
      return `${key.slice(0, 8)}${'*'.repeat(key.length - 12)}${key.slice(-4)}`
    }

    // 🔒 SECURITY: NEVER send full API key to client
    // Full key is only used server-side for API calls
    return NextResponse.json({ 
      // geminiApiKey: REMOVED for security - full key never leaves server
      maskedApiKey: maskApiKey(user?.geminiApiKey || null), // Masked version for display
      hasApiKey: !!user?.geminiApiKey
    })

  } catch (error) {
    console.error('[API] Get API key error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API Key' },
      { status: 500 }
    )
  }
}

