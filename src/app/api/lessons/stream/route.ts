import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamGenerateContent, CREDITS } from '@/lib/gemini'

/**
 * POST /api/lessons/stream
 * Stream lesson generation in real-time using Server-Sent Events
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { topic, difficulty = 'beginner', duration = 30 } = await req.json()

    if (!topic) {
      return new Response('Topic is required', { status: 400 })
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, geminiApiKey: true }
    })

    if (!user || user.credits < CREDITS.COURSE) {
      return new Response(
        `Insufficient credits. You need ${CREDITS.COURSE} credits to generate a course.`,
        { status: 403 }
      )
    }

    // Create lesson generation prompt
    const prompt = `You are an expert educator. Create a comprehensive learning course about "${topic}" for ${difficulty} level learners.

The course should take approximately ${duration} minutes to complete.

Please generate a detailed course structure in JSON format with the following structure:

{
  "title": "Course title",
  "description": "Brief course description",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "order": 1,
      "sections": [
        {
          "title": "Section title",
          "content": "Detailed Markdown content with examples, code snippets if applicable, and clear explanations. Use proper Markdown formatting with headings (##, ###), lists, code blocks, etc.",
          "order": 1,
          "duration": 10
        }
      ]
    }
  ]
}

Requirements:
- Create 3-4 modules
- Each module should have 3-4 sections
- Content should be detailed and educational
- Use Markdown formatting in content
- Include practical examples
- Make it engaging and easy to understand
- Total duration should be around ${duration} minutes

Return ONLY the JSON object, no additional text.`

    // Create a TransformStream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start streaming in background
    ;(async () => {
      try {
        let fullContent = ''

        // Stream content generation
        for await (const chunk of streamGenerateContent(prompt)) {
          fullContent += chunk
          
          // Send chunk to client
          const data = JSON.stringify({ type: 'chunk', content: chunk })
          await writer.write(encoder.encode(`data: ${data}\n\n`))
        }

        // Parse and save the complete lesson
        try {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = fullContent.match(/```json\n([\s\S]*?)\n```/) || 
                          fullContent.match(/```\n([\s\S]*?)\n```/)
          const jsonText = jsonMatch ? jsonMatch[1] : fullContent
          const courseData = JSON.parse(jsonText)

          // Save to database
          const lesson = await prisma.lesson.create({
            data: {
              userId: session.user.id,
              title: courseData.title,
              description: courseData.description,
              topic,
              difficulty,
              duration,
              content: JSON.stringify(courseData),
              modules: {
                create: courseData.modules.map((mod: any, idx: number) => ({
                  title: mod.title,
                  description: mod.description,
                  order: mod.order || idx + 1,
                  sections: {
                    create: mod.sections.map((sec: any, secIdx: number) => ({
                      title: sec.title,
                      content: sec.content,
                      order: sec.order || secIdx + 1,
                      duration: sec.duration || 10
                    }))
                  }
                }))
              }
            }
          })

          // Deduct credits
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              credits: {
                decrement: CREDITS.COURSE
              }
            }
          })

          // Send completion event
          const completeData = JSON.stringify({
            type: 'complete',
            lessonId: lesson.id,
            creditsUsed: CREDITS.COURSE,
            remainingCredits: Number(user.credits) - CREDITS.COURSE
          })
          await writer.write(encoder.encode(`data: ${completeData}\n\n`))

        } catch (parseError) {
          // Send error event
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to parse lesson content'
          })
          await writer.write(encoder.encode(`data: ${errorData}\n\n`))
        }

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
    console.error('[API] Stream lesson error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to stream lesson', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}

