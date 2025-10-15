import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContent, parseJSONResponse, CREDITS } from '@/lib/gemini'

/**
 * POST /api/mindmap/generate
 * Generate a mindmap structure from lesson content using Mermaid syntax
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { lessonId } = await req.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Get lesson data
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
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Check if mindmap already exists
    const existingMindmap = await prisma.mindmap.findUnique({
      where: { lessonId }
    })

    if (existingMindmap) {
      return NextResponse.json({
        success: true,
        mindmap: JSON.parse(existingMindmap.structure)
      })
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })

    if (!user || user.credits < CREDITS.MINDMAP) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${CREDITS.MINDMAP} credits to generate a mindmap.` },
        { status: 403 }
      )
    }

    // Create Mermaid mindmap prompt
    const prompt = `Create a mindmap structure for the course "${lesson.title}".

Generate a JSON structure for React Flow with nodes and edges:

{
  "nodes": [
    {
      "id": "course",
      "type": "courseNode",
      "position": {"x": 400, "y": 50},
      "data": {"label": "${lesson.title}", "description": "${lesson.description || ''}"}
    }
  ],
  "edges": []
}

Use these node types:
- "courseNode" for the main course (position at top center around x:400, y:50)
- "moduleNode" for modules (spread horizontally below course, y:200)
- "sectionNode" for sections (below each module, y:350)

Course modules and sections:
${lesson.modules.map((mod, idx) => `
Module ${idx + 1}: ${mod.title}
Sections: ${mod.sections.map(sec => sec.title).join(', ')}
`).join('\n')}

Position nodes in a tree layout with proper spacing (150-200px horizontal, 150px vertical).
Create edges connecting course -> modules and modules -> sections.
Return ONLY the JSON object.`

    // Generate mindmap with Gemini
    const response = await generateContent(prompt)
    
    let mindmapData
    try {
      mindmapData = parseJSONResponse(response)
    } catch (e) {
      // Fallback: create simple mindmap structure
      mindmapData = {
        nodes: [
          {
            id: 'course',
            type: 'courseNode',
            position: { x: 400, y: 50 },
            data: { label: lesson.title, description: lesson.description }
          },
          ...lesson.modules.map((mod, modIdx) => ({
            id: `module-${mod.id}`,
            type: 'moduleNode',
            position: { x: 200 + modIdx * 250, y: 200 },
            data: { label: mod.title, description: mod.description }
          }))
        ],
        edges: [
          ...lesson.modules.map((mod) => ({
            id: `edge-course-module-${mod.id}`,
            source: 'course',
            target: `module-${mod.id}`,
            type: 'smoothstep'
          }))
        ]
      }
    }

    // Save mindmap to database
    const savedMindmap = await prisma.mindmap.create({
      data: {
        lessonId: lesson.id,
        structure: JSON.stringify(mindmapData)
      }
    })

    // Deduct credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: CREDITS.MINDMAP
        }
      }
    })

    return NextResponse.json({
      success: true,
      mindmap: mindmapData,
      creditsUsed: CREDITS.MINDMAP,
      remainingCredits: Number(user.credits) - CREDITS.MINDMAP
    })

  } catch (error) {
    console.error('[API] Generate mindmap error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate mindmap', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

