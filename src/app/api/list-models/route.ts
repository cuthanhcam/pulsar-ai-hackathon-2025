import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with API key
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true }
    })

    const apiKey = user?.geminiApiKey
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 })
    }

    // Call Google AI API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('List models error:', errorText)
      return NextResponse.json(
        { error: 'Failed to list models', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Filter for models that support generateContent
    const generativeModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ) || []

    console.log('Available generative models:', generativeModels.map((m: any) => m.name))

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      generativeModels: generativeModels.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods
      }))
    })

  } catch (error) {
    console.error('List models error:', error)
    return NextResponse.json(
      { error: 'Failed to list models', details: String(error) },
      { status: 500 }
    )
  }
}

