import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/progress
 * Get user's learning progress and statistics
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create progress
    let progress = await prisma.progress.findUnique({
      where: { userId: session.user.id }
    })

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId: session.user.id,
          lessonsCompleted: 0,
          quizzesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      })
    }

    // Get lessons stats
    const lessons = await prisma.lesson.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get quiz results stats
    const quizResults = await prisma.quizResult.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        quiz: {
          include: {
            lesson: true
          }
        }
      }
    })

    // Calculate average quiz score
    const avgScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
      : 0

    // Get learning activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.lesson.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Update last accessed
    await prisma.progress.update({
      where: { userId: session.user.id },
      data: {
        lastAccessedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      progress: {
        lessonsCompleted: progress.lessonsCompleted,
        quizzesCompleted: progress.quizzesCompleted,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastAccessedAt: progress.lastAccessedAt,
        avgQuizScore: avgScore,
        totalLessons: lessons.length,
        recentLessons: lessons.slice(0, 5),
        recentQuizResults: quizResults.slice(0, 5),
        activityData: recentActivity
      }
    })

  } catch (error) {
    console.error('[API] Get progress error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch progress', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/progress
 * Update user progress manually
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

    const { action, lessonId } = await req.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get current progress
    let progress = await prisma.progress.findUnique({
      where: { userId: session.user.id }
    })

    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId: session.user.id,
          lessonsCompleted: 0,
          quizzesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      })
    }

    // Calculate streak
    const currentStreak = calculateStreak(progress.lastAccessedAt)

    // Update based on action
    switch (action) {
      case 'lesson_completed':
        await prisma.progress.update({
          where: { userId: session.user.id },
          data: {
            lessonsCompleted: { increment: 1 },
            currentStreak: currentStreak,
            longestStreak: Math.max(currentStreak, progress.longestStreak),
            lastAccessedAt: new Date()
          }
        })
        break

      case 'quiz_completed':
        await prisma.progress.update({
          where: { userId: session.user.id },
          data: {
            quizzesCompleted: { increment: 1 },
            currentStreak: currentStreak,
            longestStreak: Math.max(currentStreak, progress.longestStreak),
            lastAccessedAt: new Date()
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Get updated progress
    const updatedProgress = await prisma.progress.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      success: true,
      progress: updatedProgress
    })

  } catch (error) {
    console.error('[API] Update progress error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update progress', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate learning streak
 */
function calculateStreak(lastAccessedAt: Date | null): number {
  if (!lastAccessedAt) return 1

  const now = new Date()
  const lastAccess = new Date(lastAccessedAt)
  
  // Set both to start of day for comparison
  now.setHours(0, 0, 0, 0)
  lastAccess.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) {
    // Same day - return existing streak (will not increment)
    return 0 // Signal to not change
  } else if (daysDiff === 1) {
    // Next day - increment streak
    return 1
  } else {
    // Streak broken - reset to 1
    return 1
  }
}

