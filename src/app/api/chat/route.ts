import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { qdrant } from '@/lib/qdrant'
import { getApiKey } from '@/lib/encryption'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Embed text using Ollama API
async function embedText(text: string) {
  try {
    // Use Tailscale URL if available, fallback to localhost
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
    const res = await fetch(`${ollamaUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mxbai-embed-large",
        input: text,
      }),
    })

    if (!res.ok) {
      throw new Error(`Ollama embed API returned ${res.status}`)
    }

    const data = await res.json()
    return data.embeddings?.[0] || data.embedding || []
  } catch (error) {
    console.error('[Chat API] Embedding failed:', error)
    return null
  }
}

export async function POST(req: Request) {
  console.log('[Chat API] === New chat request ===')
  try {
    const session = await getServerSession(authOptions)
    console.log('[Chat API] Session:', session?.user?.email)
    
    if (!session?.user?.id) {
      console.log('[Chat API] ❌ Unauthorized - no session')
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

    if (!user?.geminiApiKey) {
      console.log('[Chat API] ❌ No API key found')
      return NextResponse.json(
        { error: 'Gemini API Key not configured. Please add it in Settings.' },
        { status: 400 }
      )
    }

    // 🔒 Get API key (auto-decrypt if encrypted, or use as-is if plain text)
    const apiKey = await getApiKey(user.geminiApiKey)

    if (!apiKey) {
      console.log('[Chat API] ❌ Failed to get API key')
      return NextResponse.json(
        { error: 'Failed to retrieve API key' },
        { status: 400 }
      )
    }

    const { message, lessonId, chatHistory } = await req.json()
    console.log('[Chat API] Message:', message)
    console.log('[Chat API] LessonId:', lessonId)
    console.log('[Chat API] Chat history length:', chatHistory?.length || 0)

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Initialize Gemini AI with API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Get lesson or section context if lessonId provided
    let lessonContext = ''
    if (lessonId) {
      try {
        // Try to find as lesson first
        let lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          include: {
            modules: {
              include: {
                sections: true
              }
            }
          }
        })

        // If not found, try to find as section ID
        if (!lesson) {
          const section = await prisma.section.findUnique({
            where: { id: lessonId },
            include: {
              module: {
                include: {
                  lesson: true
                }
              }
            }
          })

          if (section) {
            lessonContext = `
You are helping a student understand this section:

Section Title: ${section.title}
Module: ${section.module.title}
Course: ${section.module.lesson.title}

The student is studying this specific section and may ask questions about it.
Please provide detailed explanations related to "${section.title}".
`
          } else {
            // Section not found in DB - fallback to general tutor
            console.log('[Chat API] Section not found in DB:', lessonId)
            lessonContext = `
You are a helpful AI tutor. The student is asking a question about their current study material.
Even though the specific content is not available, provide a helpful and educational response.
`
          }
        } else {
          lessonContext = `
You are helping a student understand this lesson:

Title: ${lesson.title}
Description: ${lesson.description}

Course Content Summary:
${lesson.modules.map(mod => `
Module: ${mod.title}
${mod.sections.map(sec => `- ${sec.title}`).join('\n')}
`).join('\n')}

The student is studying this topic and may ask questions about it.
`
        }
      } catch (dbError) {
        console.error('[Chat API] Database error:', dbError)
        // Fallback to general tutor mode
        lessonContext = `
You are a helpful AI tutor. Please answer the student's question to the best of your ability.
`
      }
    }

    // Build conversation history
    let conversationHistory = ''
    if (chatHistory && Array.isArray(chatHistory)) {
      console.log('[Chat API] Processing chat history:', JSON.stringify(chatHistory))
      conversationHistory = chatHistory.map((msg: any) => 
        `${msg.role === 'user' ? 'Student' : 'AI Tutor'}: ${msg.message || msg.content || ''}`
      ).join('\n')
    }

    // RAG: Retrieve relevant context from Qdrant
    let ragContext = ''
    
    // Skip RAG if Ollama URL is not configured (e.g., on production without Tailscale)
    if (process.env.OLLAMA_URL) {
      try {
        console.log('[Chat API] 🔍 Embedding user query for RAG...')
        const queryEmbedding = await embedText(message)

        if (queryEmbedding && queryEmbedding.length > 0) {
          console.log('[Chat API] 📚 Searching Qdrant for similar chunks...')
          const results = await qdrant.search('pulsar_lessons', {
            vector: queryEmbedding,
            limit: 5,
            filter: {
              must: [
                { key: 'userId', match: { value: session.user.id } },
                ...(lessonId ? [{ key: 'courseId', match: { value: lessonId } }] : []),
              ],
            },
          })

          if (results.length > 0) {
            ragContext = results
              .map((r: any) => r.payload.text)
              .join('\n---\n')
            console.log(`[Chat API] ✅ Retrieved ${results.length} context chunks from Qdrant`)
          } else {
            console.log('[Chat API] ℹ️  No relevant context found in Qdrant.')
          }
        } else {
          console.log('[Chat API] ⚠️ Embedding failed, skipping RAG')
        }
      } catch (ragError) {
        console.error('[Chat API] ⚠️ RAG retrieval failed (non-critical):', ragError)
        // Don't fail the request if RAG fails
      }
    } else {
      console.log('[Chat API] ℹ️ OLLAMA_URL not configured, skipping RAG (using standard chat mode)')
    }

    console.log('[Chat API] 🤖 Calling Gemini API...')
    const prompt = `You are an expert AI tutor. You are friendly, patient, and skilled at explaining complex concepts in simple terms. Be accurate, concise, and grounded in the provided context.

${lessonContext}

${ragContext ? `\nRetrieved Context (from student's course materials):\n${ragContext}\n` : ''}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}

Student's question: ${message}

If the answer exists in the retrieved context, use it directly and cite it. If not, provide a general educational response and politely note that this specific topic might not be covered in the current course materials.

Keep your response concise (2-4 paragraphs) but informative.`

    const result = await generativeModel.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()
    console.log('[Chat API] ✅ Got response from Gemini')

    // Save chat messages to database
    try {
      console.log('[Chat API] 💾 Saving to database...')
      await prisma.chatMessage.createMany({
        data: [
          {
            userId: session.user.id,
            lessonId: null, // Don't save lessonId for now to avoid FK constraint issues
            role: 'user',
            content: message
          },
          {
            userId: session.user.id,
            lessonId: null,
            role: 'assistant',
            content: aiResponse
          }
        ]
      })
      console.log('[Chat API] ✅ Saved to database')
    } catch (dbSaveError) {
      console.error('[Chat API] ⚠️ Failed to save to database (non-critical):', dbSaveError)
      // Don't fail the request if DB save fails
    }

    console.log('[Chat API] ✅ Request completed successfully')
    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error) {
    console.error('[Chat API] ❌ ERROR:', error)
    console.error('[Chat API] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
