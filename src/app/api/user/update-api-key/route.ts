import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { geminiApiKey } = await req.json()

    if (!geminiApiKey || !geminiApiKey.trim()) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 400 }
      )
    }

    // Update user's API key
    await prisma.user.update({
      where: { id: session.user.id },
      data: { geminiApiKey: geminiApiKey.trim() }
    })

    return NextResponse.json({ 
      success: true,
      message: 'API Key updated successfully' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update API Key', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
