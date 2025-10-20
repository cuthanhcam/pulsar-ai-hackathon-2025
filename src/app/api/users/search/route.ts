import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Search users

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ users: [] })
    }

    // SQLite doesn't support case-insensitive search well with Prisma
    // Fetch all users (excluding current user) and filter in JavaScript
    const allUsers = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            lessons: true,
            posts: true,
            postComments: true
          }
        }
      }
    })

    // Case-insensitive search in JavaScript
    const lowerQuery = query.toLowerCase()
    const filteredUsers = allUsers.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(lowerQuery)
      const emailMatch = user.email?.toLowerCase().includes(lowerQuery)
      const phoneMatch = user.phone?.toLowerCase().includes(lowerQuery)
      return nameMatch || emailMatch || phoneMatch
    })

    // Sort by most recent and limit to 20
    const sortedUsers = filteredUsers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)

    return NextResponse.json({ users: sortedUsers })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}

