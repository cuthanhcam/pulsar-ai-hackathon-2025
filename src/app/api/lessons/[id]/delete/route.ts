import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessonId = params.id

    // Verify the lesson belongs to the user
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { userId: true }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (lesson.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete the lesson (cascade will handle modules, sections, etc.)
    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Lesson deleted successfully' 
    })

  } catch (error) {
    console.error('Delete lesson error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}

