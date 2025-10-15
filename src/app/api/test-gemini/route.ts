import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true }
    })

    const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Try different models
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-pro',
    ]

    const results = []

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        // Try to generate content
        const result = await model.generateContent('Hello')
        const text = result.response.text()
        
        results.push({
          model: modelName,
          status: 'SUCCESS ✅',
          response: text.substring(0, 50) + '...'
        })
        
        console.log(`✅ ${modelName} works!`)
        
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'FAILED ❌',
          error: error.message
        })
        console.log(`❌ ${modelName} failed:`, error.message)
      }
    }

    return NextResponse.json({
      message: 'Model availability test completed',
      apiKeyLength: apiKey.length,
      results
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

