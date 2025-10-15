import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    console.log('[API] Fetching lesson:', params.id)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('[API] Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch lesson with all related data
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user owns this lesson
      },
      include: {
        modules: {
          orderBy: {
            order: 'asc'
          },
          include: {
            sections: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        mindmap: true
      }
    })

    if (!lesson) {
      console.log('[API] Lesson not found or unauthorized')
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    console.log('[API] Lesson found:', {
      id: lesson.id,
      title: lesson.title,
      modulesCount: lesson.modules?.length || 0,
      sectionsPerModule: lesson.modules?.map(m => m.sections?.length || 0) || []
    })

    // Transform sections to lessons for frontend compatibility
    const transformedLesson = {
      ...lesson,
      modules: lesson.modules.map(module => {
        const lessons = module.sections.map(section => ({
          id: section.id,
          title: section.title,
          content: section.content,
          duration: section.duration.toString(),
          completed: section.completed,
          order: section.order
        }))
        
        console.log(`[API] Transformed module "${module.title}":`, {
          sectionsCount: module.sections.length,
          lessonsCount: lessons.length,
          lessonTitles: lessons.map(l => l.title)
        })
        
        return {
          ...module,
          lessons,
          // Remove sections field to avoid confusion
          sections: undefined
        }
      })
    }

    console.log('[API] Transformation complete:', {
      modulesCount: transformedLesson.modules.length,
      lessonsPerModule: transformedLesson.modules.map(m => m.lessons?.length || 0)
    })

    // Parse mindmap structure if exists
    if (transformedLesson.mindmap) {
      try {
        transformedLesson.mindmap = {
          ...transformedLesson.mindmap,
          structure: JSON.parse(transformedLesson.mindmap.structure as string)
        } as any
      } catch (e) {
        console.error('[API] Failed to parse mindmap structure:', e)
        transformedLesson.mindmap = null as any
      }
    }

    return NextResponse.json({ lesson: transformedLesson })

  } catch (error) {
    console.error('[API] Fetch lesson error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { completed } = body

    // Update lesson
    const lesson = await prisma.lesson.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        completed: completed ?? undefined
      }
    })

    return NextResponse.json({ lesson })

  } catch (error) {
    console.error('[API] Update lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete lesson (cascade will delete modules, sections, and mindmap)
    await prisma.lesson.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API] Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
