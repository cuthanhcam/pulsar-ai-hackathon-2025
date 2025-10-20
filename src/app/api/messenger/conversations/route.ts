import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all conversations for current user

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: session.user.id },
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      distinct: ['id']
    })

    // Format conversations with unread count
    const formattedConversations = conversations.map(conv => ({
      ...conv,
      unreadCount: conv._count.messages
    }))

    // Additional deduplication: Keep only latest conversation per unique user pair
    const deduplicatedConversations = formattedConversations.reduce((acc, conv) => {
      // Find the other user in this conversation
      const otherUser = conv.participants.find(p => p.userId !== session.user.id)
      if (!otherUser) return acc

      // Check if we already have a conversation with this user
      const existingIndex = acc.findIndex(existing => {
        const existingOtherUser = existing.participants.find(p => p.userId !== session.user.id)
        return existingOtherUser?.userId === otherUser.userId
      })

      if (existingIndex === -1) {
        // No existing conversation with this user, add it
        acc.push(conv)
      } else {
        // Already have conversation with this user, keep the most recent one
        const existing = acc[existingIndex]
        if (new Date(conv.updatedAt) > new Date(existing.updatedAt)) {
          acc[existingIndex] = conv
        }
      }

      return acc
    }, [] as typeof formattedConversations)

    return NextResponse.json({ conversations: deduplicatedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// Create or get conversation with another user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId } = await request.json()

    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 })
    }

    // Check if 1-on-1 conversation already exists between these two users
    // Get all conversations where current user is a participant
    const userConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Find 1-on-1 conversation with the recipient (exactly 2 participants)
    const existingConversations = userConversations.filter(conv => {
      if (conv.participants.length !== 2) return false
      const participantIds = conv.participants.map(p => p.userId)
      return participantIds.includes(session.user.id) && participantIds.includes(recipientId)
    })

    if (existingConversations.length > 0) {
      // If multiple conversations exist (duplicates), return the most recent one
      const mostRecent = existingConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0]
      
      return NextResponse.json({ conversation: mostRecent })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: recipientId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

