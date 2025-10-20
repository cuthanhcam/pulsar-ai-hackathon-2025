import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

// GET: List all users
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    } : {}

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lessons: true,
            quizResults: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Convert BigInt to Number for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      credits: Number(user.credits)
    }))

    return NextResponse.json({
      users: serializedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
