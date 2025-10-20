import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    console.log('[API] /api/lessons/clone - Request received')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error('[API] Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API] User:', session.user.email)

    const { lessonId } = await req.json()
    console.log('[API] Cloning lesson:', lessonId)

    if (!lessonId) {
      console.error('[API] Missing lesson ID')
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Fetch the original lesson with all its modules and sections
    const originalLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        modules: {
          include: {
            sections: true
          },
          orderBy: { order: 'asc' }
        },
        mindmap: true
      }
    })

    if (!originalLesson) {
      console.error('[API] Lesson not found:', lessonId)
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    console.log('[API] Original lesson found:', originalLesson.title, 'with', originalLesson.modules.length, 'modules')

    // Check if cloning someone else's course
    const CLONE_COST = 30
    const isOwnCourse = originalLesson.userId === session.user.id

    if (!isOwnCourse) {
      console.log('[API] Cloning someone else\'s course - checking credits')
      
      // Get user's current credits
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      })

      if (!user) {
        console.error('[API] User not found:', session.user.id)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const currentCredits = Number(user.credits)
      console.log('[API] User credits:', currentCredits, 'Required:', CLONE_COST)

      if (currentCredits < CLONE_COST) {
        console.error('[API] Insufficient credits:', currentCredits, '<', CLONE_COST)
        return NextResponse.json({ 
          error: 'Insufficient credits',
          required: CLONE_COST,
          current: currentCredits,
          message: `Bạn cần ${CLONE_COST} credits để lưu khóa học này. Hiện tại bạn có ${currentCredits} credits.`
        }, { status: 402 }) // 402 Payment Required
      }

      // Deduct credits and log transaction
      console.log('[API] Deducting', CLONE_COST, 'credits from user')
      
      await prisma.$transaction([
        // Update user credits
        prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: CLONE_COST } }
        }),
        // Log credit transaction
        prisma.creditTransaction.create({
          data: {
            userId: session.user.id,
            amount: -CLONE_COST,
            type: 'course_clone',
            description: `Cloned course: ${originalLesson.title}`,
            balanceBefore: currentCredits,
            balanceAfter: currentCredits - CLONE_COST
          }
        })
      ])
      
      console.log('[API] Credits deducted and transaction logged. New balance:', currentCredits - CLONE_COST)
    } else {
      console.log('[API] Cloning own course - no credits required')
    }

    // Create a copy of the lesson for the current user
    const clonedLesson = await prisma.lesson.create({
      data: {
        userId: session.user.id,
        title: `${originalLesson.title} (Copy)`,
        description: originalLesson.description,
        content: originalLesson.content,
        topic: originalLesson.topic,
        difficulty: originalLesson.difficulty,
        duration: originalLesson.duration,
        completed: false,
        isPublic: false, // Private by default
        views: 0,
        // Clone mindmap if exists
        mindmap: originalLesson.mindmap ? {
          create: {
            structure: originalLesson.mindmap.structure
          }
        } : undefined,
        // Clone modules and sections
        modules: {
          create: originalLesson.modules.map(module => ({
            title: module.title,
            description: module.description,
            order: module.order,
            completed: false,
            sections: {
              create: module.sections.map(section => ({
                title: section.title,
                content: section.content,
                order: section.order,
                duration: section.duration,
                completed: false
              }))
            }
          }))
        }
      },
      include: {
        modules: {
          include: {
            sections: true
          }
        }
      }
    })

    console.log('[API] Course cloned successfully:', clonedLesson.id, clonedLesson.title)
    
    // Get updated user credits
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Course cloned successfully',
      lesson: clonedLesson,
      credits: {
        cost: isOwnCourse ? 0 : CLONE_COST,
        remaining: Number(updatedUser?.credits || 0)
      }
    })
  } catch (error) {
    console.error('[API] ❌ Error cloning lesson:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('[API] Error message:', error.message)
      console.error('[API] Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clone course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

