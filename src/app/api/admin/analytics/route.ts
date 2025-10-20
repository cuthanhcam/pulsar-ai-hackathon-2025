import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get time range from query params
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || '30d'
    
    // Calculate date filter
    let dateFilter: Date
    if (range === '7d') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === '30d') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    } else {
      dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }

    // Fetch data in parallel for performance
    const [
      totalUsers,
      totalCourses,
      totalQuizzes,
      completedCourses,
      quizResults,
      users,
      courses,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.quizResult.count(),
      prisma.lesson.count({ where: { completed: true } }),
      prisma.quizResult.findMany({
        select: {
          score: true,
          passed: true,
          createdAt: true
        },
        where: {
          createdAt: { gte: dateFilter }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          createdAt: true
        },
        where: {
          createdAt: { gte: dateFilter }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.lesson.findMany({
        select: {
          topic: true,
          difficulty: true
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          createdAt: true,
          updatedAt: true
        },
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    // Calculate completion rate
    const completionRate = totalCourses > 0 
      ? Math.round((completedCourses / totalCourses) * 100) 
      : 0

    // Calculate average score
    const averageScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
      : 0

    // Calculate pass rate
    const passRate = quizResults.length > 0
      ? Math.round((quizResults.filter(r => r.passed).length / quizResults.length) * 100)
      : 0

    // Group users by date for growth chart
    const userGrowth = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0]
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.count++
      } else {
        acc.push({ date, count: 1 })
      }
      return acc
    }, [] as Array<{ date: string; count: number }>)

    // Count courses by difficulty
    const coursesByDifficulty = courses.reduce((acc, course) => {
      const existing = acc.find(item => item.difficulty === course.difficulty)
      if (existing) {
        existing.count++
      } else {
        acc.push({ difficulty: course.difficulty, count: 1 })
      }
      return acc
    }, [] as Array<{ difficulty: string; count: number }>)

    // Count popular topics
    const popularTopics = courses.reduce((acc, course) => {
      const existing = acc.find(item => item.topic === course.topic)
      if (existing) {
        existing.count++
      } else {
        acc.push({ topic: course.topic, count: 1 })
      }
      return acc
    }, [] as Array<{ topic: string; count: number }>)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const data = {
      overview: {
        totalUsers,
        totalCourses,
        totalQuizzes,
        completionRate,
        averageScore,
        activeToday: recentUsers.length
      },
      userGrowth,
      coursesByDifficulty,
      popularTopics,
      quizPerformance: {
        averageScore,
        passRate,
        totalAttempts: quizResults.length
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

