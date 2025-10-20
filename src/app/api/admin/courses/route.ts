import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'date'
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'title') {
      orderBy = { title: 'asc' }
    } else if (sortBy === 'modules') {
      orderBy = { modules: { _count: 'desc' } }
    }

    // Get courses with pagination
    const [courses, totalCount] = await Promise.all([
      prisma.lesson.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          topic: true,
          difficulty: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          _count: {
            select: {
              modules: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.lesson.count({ where })
    ])

    // Get top creators stats
    const topCreators = await prisma.lesson.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get user details for top creators
    const topCreatorIds = topCreators.map(c => c.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: topCreatorIds } },
      select: { id: true, email: true, name: true }
    })

    const topCreatorsWithDetails = topCreators.map(creator => {
      const user = users.find(u => u.id === creator.userId)
      return {
        userId: creator.userId,
        courseCount: creator._count.id,
        email: user?.email || 'Unknown',
        name: user?.name || null
      }
    })

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      },
      topCreators: topCreatorsWithDetails
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
    }
  }
