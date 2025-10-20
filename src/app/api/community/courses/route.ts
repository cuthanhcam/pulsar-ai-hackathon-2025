import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'popular'

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build orderBy clause
    let orderBy: any
    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' }
        break
      case 'rated':
        orderBy = { ratings: { _count: 'desc' } }
        break
      case 'popular':
      default:
        orderBy = { enrollments: { _count: 'desc' } }
        break
    }

    // Fetch public courses
    const courses = await prisma.lesson.findMany({
      where: {
        isPublic: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        topic: true,
        difficulty: true,
        duration: true,
        views: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
            ratings: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        },
        enrollments: userId ? {
          where: {
            userId: userId
          },
          select: {
            id: true
          }
        } : false
      },
      orderBy,
      take: 50
    })

    // Calculate average rating and check if user enrolled
    const coursesWithStats = courses.map(course => {
      const avgRating = course.ratings.length > 0
        ? course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length
        : null

      const isEnrolled = userId && 'enrollments' in course && Array.isArray(course.enrollments)
        ? course.enrollments.length > 0
        : false

      const { ratings, enrollments, ...rest } = course

      return {
        ...rest,
        avgRating,
        isEnrolled
      }
    })

    return NextResponse.json({ courses: coursesWithStats })
  } catch (error) {
    console.error('Error fetching public courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

