import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json({ 
      geminiApiKey: user?.geminiApiKey || null
    })

  } catch (error) {
    console.error('[API] Get API key error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API Key' },
      { status: 500 }
    )
  }
}

