import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET() {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    )
  }

  try {
    // Get total users
    const totalUsers = await prisma.user.count()

    // Get users created in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get total courses
    const totalCourses = await prisma.lesson.count()

    // Get total quizzes completed
    const totalQuizzes = await prisma.quizResult.count()

    // Get total credits in system
    const creditsResult = await prisma.user.aggregate({
      _sum: {
        credits: true
      }
    })

    // Get average quiz score
    const avgScoreResult = await prisma.quizResult.aggregate({
      _avg: {
        score: true
      }
    })

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    // Get recent activities (last 10)
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const recentCourses = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Serialize BigInt values
    const serializedCredits = creditsResult._sum.credits 
      ? Number(creditsResult._sum.credits) 
      : 0

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsers,
        totalCourses,
        totalQuizzes,
        totalCredits: serializedCredits,
        avgQuizScore: Math.round(avgScoreResult._avg.score || 0)
      },
      usersByRole: usersByRole.map(r => ({
        role: r.role,
        count: r._count
      })),
      recentActivity: {
        users: recentUsers,
        courses: recentCourses
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

