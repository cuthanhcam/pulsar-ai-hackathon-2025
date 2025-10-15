import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const QUIZ_CREDIT_COST = 5

export async function POST(req: Request) {
  console.log('[Quiz API] === New quiz generation request ===')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('[Quiz API] Session:', session?.user?.email)
    
    if (!session?.user?.id) {
      console.log('[Quiz API] ❌ Unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sectionId, sectionTitle, moduleTitle } = await req.json()
    console.log('[Quiz API] Section:', sectionId, sectionTitle)

    if (!sectionId || !sectionTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, geminiApiKey: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.credits < QUIZ_CREDIT_COST) {
      console.log('[Quiz API] ❌ Insufficient credits')
      return NextResponse.json(
        { error: 'Không đủ credits. Bạn cần ít nhất 5 credits để tạo quiz.' },
        { status: 400 }
      )
    }

    // Get API key
    const apiKey = user.geminiApiKey || process.env.GEMINI_API_KEY

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.log('[Quiz API] ❌ No API key')
      return NextResponse.json(
        { error: 'Gemini API Key not configured' },
        { status: 400 }
      )
    }

    // Get section content
    let sectionContent = ''
    try {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        select: { content: true }
      })
      sectionContent = section?.content || ''
    } catch (err) {
      console.log('[Quiz API] Section not in DB, will use title only')
    }

    // Generate quiz with Gemini
    console.log('[Quiz API] 🤖 Calling Gemini to generate quiz...')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an expert educational content creator. Generate a quiz for this section:

**Module:** ${moduleTitle}
**Section:** ${sectionTitle}
${sectionContent ? `**Content:** ${sectionContent.substring(0, 1000)}...` : ''}

Generate exactly 5 multiple-choice questions that test understanding of this content.

Return ONLY a valid JSON array in this exact format (no markdown, no explanation):
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct"
  },
  ...
]

Requirements:
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions should be clear and test actual understanding
- Explanations should be concise (1-2 sentences)
- Use Vietnamese language
- Return ONLY the JSON array, nothing else`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let quizText = response.text()

    console.log('[Quiz API] Raw response:', quizText.substring(0, 200))

    // Clean up response
    quizText = quizText.trim()
    
    // Remove markdown code blocks if present
    if (quizText.startsWith('```json')) {
      quizText = quizText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (quizText.startsWith('```')) {
      quizText = quizText.replace(/```\n?/g, '')
    }
    
    quizText = quizText.trim()

    // Parse quiz
    let questions
    try {
      questions = JSON.parse(quizText)
    } catch (parseError) {
      console.error('[Quiz API] Parse error:', parseError)
      console.error('[Quiz API] Text to parse:', quizText)
      return NextResponse.json(
        { error: 'Failed to parse quiz response' },
        { status: 500 }
      )
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid quiz format' },
        { status: 500 }
      )
    }

    console.log('[Quiz API] ✅ Generated', questions.length, 'questions')

    // Deduct credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: QUIZ_CREDIT_COST } }
    })

    console.log('[Quiz API] 💰 Deducted', QUIZ_CREDIT_COST, 'credits')

    return NextResponse.json({
      success: true,
      questions,
      creditsUsed: QUIZ_CREDIT_COST,
      creditsRemaining: Number(user.credits) - QUIZ_CREDIT_COST
    })

  } catch (error) {
    console.error('[Quiz API] ❌ ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
