import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamGenerateContent, CREDITS } from '@/lib/gemini'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * POST /api/chat/stream
 * Stream chat responses in real-time using Server-Sent Events
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { lessonId, messages }: { lessonId: string; messages: Message[] } = await req.json()

    if (!lessonId || !messages || messages.length === 0) {
      return new Response('Lesson ID and messages are required', { status: 400 })
    }

    // Get lesson context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        modules: {
          include: {
            sections: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!lesson) {
      return new Response('Lesson not found', { status: 404 })
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })

    if (!user || user.credits < CREDITS.CHAT) {
      return new Response(
        `Insufficient credits. You need ${CREDITS.CHAT} credits per chat message.`,
        { status: 403 }
      )
    }

    // Create lesson context (summary to save tokens)
    const lessonContext = `
Course: ${lesson.title}
Description: ${lesson.description}

Modules Overview:
${lesson.modules.map((mod, idx) => `
${idx + 1}. ${mod.title}
   ${mod.sections.map(sec => `- ${sec.title}`).join('\n   ')}
`).join('\n')}
    `.trim()

    // Build conversation history
    const conversationHistory = messages
      .slice(-10) // Keep last 10 messages to save tokens
      .map((msg) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n\n')

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content

    // Create chat prompt with lesson context
    const prompt = `You are an AI tutor helping a student learn about "${lesson.title}".

LESSON CONTEXT:
${lessonContext}

IMPORTANT GUIDELINES:
1. Answer based ONLY on the lesson content above
2. If the question is outside the lesson scope, politely redirect to the lesson topics
3. Provide clear, concise explanations
4. Use examples when helpful
5. Encourage the student to explore related concepts
6. Be supportive and encouraging

CONVERSATION HISTORY:
${conversationHistory}

Current Question: ${lastUserMessage}

Please provide a helpful response:`

    // Create a TransformStream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start streaming in background
    ;(async () => {
      try {
        let fullResponse = ''

        // Stream chat response
        for await (const chunk of streamGenerateContent(prompt)) {
          fullResponse += chunk
          
          // Send chunk to client
          const data = JSON.stringify({ type: 'chunk', content: chunk })
          await writer.write(encoder.encode(`data: ${data}\n\n`))
        }

        // Save chat message to database
        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            lessonId: lesson.id,
            role: 'user',
            content: lastUserMessage
          }
        })

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            lessonId: lesson.id,
            role: 'assistant',
            content: fullResponse
          }
        })

        // Deduct credits
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            credits: {
              decrement: CREDITS.CHAT
            }
          }
        })

        // Send completion event
        const completeData = JSON.stringify({
          type: 'complete',
          creditsUsed: CREDITS.CHAT,
          remainingCredits: Number(user.credits) - CREDITS.CHAT
        })
        await writer.write(encoder.encode(`data: ${completeData}\n\n`))

      } catch (error) {
        const errorData = JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        await writer.write(encoder.encode(`data: ${errorData}\n\n`))
      } finally {
        await writer.close()
      }
    })()

    // Return SSE response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('[API] Stream chat error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to stream chat', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

