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
    const results = await prisma.quizResult.findMany({
      select: {
        id: true,
        score: true,
        completedAt: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        quiz: {
          select: {
            title: true
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 100
    })

    // Calculate stats
    const totalQuizzes = results.length
    const avgScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0
    const topScore = results.length > 0
      ? Math.max(...results.map(r => r.score))
      : 0

    return NextResponse.json({
      results,
      stats: {
        totalQuizzes,
        avgScore,
        topScore
      }
    })
  } catch (error) {
    console.error('Error fetching quiz results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz results' },
      { status: 500 }
    )
  }
}
