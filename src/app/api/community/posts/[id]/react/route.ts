import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

// Toggle reaction on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reactionType } = await request.json()
    const postId = params.id

    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Check if user already reacted
    const existingReaction = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    })

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.reactionType === reactionType) {
        await prisma.postLike.delete({
          where: { id: existingReaction.id }
        })
        return NextResponse.json({ removed: true })
      } else {
        // Update to new reaction
        await prisma.postLike.update({
          where: { id: existingReaction.id },
          data: { reactionType }
        })
        return NextResponse.json({ updated: true, reactionType })
      }
    } else {
      // Create new reaction
      await prisma.postLike.create({
        data: {
          postId,
          userId: session.user.id,
          reactionType
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

      // Create notification for post author (if not reacting to own post)
      if (post && post.userId !== session.user.id) {
        const reactionEmoji = reactionType === 'like' ? '👍' : 
                             reactionType === 'love' ? '❤️' :
                             reactionType === 'haha' ? '😆' :
                             reactionType === 'wow' ? '😮' :
                             reactionType === 'sad' ? '😢' : '😠'

        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: 'reaction',
            title: `${session.user.name || 'Someone'} reacted to your post`,
            content: `Reacted ${reactionEmoji} to "${post.lesson.title}"`,
            link: `/community`,
            isRead: false
          }
        })
      }

      return NextResponse.json({ created: true, reactionType })
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}

// Get reactions for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    // Get reaction counts by type
    const reactions = await prisma.postLike.groupBy({
      by: ['reactionType'],
      where: { postId },
      _count: true
    })

    // Get current user's reaction
    const session = await getServerSession(authOptions)
    let userReaction = null
    
    if (session?.user?.id) {
      const reaction = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id
          }
        }
      })
      userReaction = reaction?.reactionType || null
    }

    return NextResponse.json({
      reactions: reactions.map(r => ({
        type: r.reactionType,
        count: r._count
      })),
      userReaction
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

