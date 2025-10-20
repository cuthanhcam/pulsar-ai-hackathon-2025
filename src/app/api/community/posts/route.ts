import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || 'all'
    const myPosts = searchParams.get('myPosts') === 'true'

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build orderBy based on filter
    let orderBy: any = { createdAt: 'desc' }
    if (filter === 'trending') {
      orderBy = { likes: { _count: 'desc' } }
    }

    // Build where clause
    let where: any = {}
    if (myPosts && userId) {
      where.userId = userId
    }

    // Fetch posts with course details
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        userId: true,
        lessonId: true,
        caption: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            description: true,
            topic: true,
            difficulty: true,
            duration: true,
            views: true,
            _count: {
              select: {
                modules: true,
                enrollments: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        likes: userId ? {
          where: {
            userId: userId
          },
          select: {
            id: true,
            reactionType: true
          }
        } : false
      },
      orderBy,
      take: 50
    })

    // Add userReaction
    const postsWithReaction = posts.map(post => {
      const userLike = userId && 'likes' in post && Array.isArray(post.likes) && post.likes.length > 0 ? post.likes[0] : null
      return {
        ...post,
        userReaction: userLike ? userLike.reactionType : null,
        isLiked: !!userLike, // Keep for backward compatibility
        likes: undefined,
        user: {
          ...post.user,
          id: post.userId
        }
      }
    })

    return NextResponse.json({ posts: postsWithReaction })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    const { lessonId, caption } = await req.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        lessonId,
        caption: caption || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        lesson: {
          select: {
            title: true,
            topic: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Post created successfully',
      post
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

