import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

// Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            likes: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, parentId } = await request.json()
    const postId = params.id

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likes: true
      }
    })

    // Get post details for notification
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, name: true } },
        lesson: { select: { title: true } }
      }
    })

    // Create notification for post author (if not commenting on own post)
    if (post && post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'comment',
          title: `${session.user.name || 'Someone'} commented on your post`,
          content: `"${content.trim().substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
          link: `/community`,
          isRead: false
        }
      })
    }

    // If it's a reply, notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: parentId },
        select: { userId: true }
      })

      if (parentComment && parentComment.userId !== session.user.id && parentComment.userId !== post?.userId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'comment',
            title: `${session.user.name || 'Someone'} replied to your comment`,
            content: `"${content.trim().substring(0, 100)}${content.length > 100 ? '...' : ''}"`,
            link: `/community`,
            isRead: false
          }
        })
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

