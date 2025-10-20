import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's API key
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true }
    })

    const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try to list available models
    try {
      const models = await genAI.listModels()
      const availableModels = models.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        description: m.description,
        supportedMethods: m.supportedGenerationMethods
      }))
      
      return NextResponse.json({ models: availableModels })
    } catch (error) {
      console.error('Error listing models:', error)
      return NextResponse.json(
        { 
          error: 'Unable to list models',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
