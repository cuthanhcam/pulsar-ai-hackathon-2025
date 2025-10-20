import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    const { lessonId } = await req.json()

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Check if lesson exists and is public
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, isPublic: true }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    if (!lesson.isPublic) {
      return NextResponse.json(
        { error: 'This course is not public' },
        { status: 403 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({
        message: 'Already enrolled',
        enrollment: existingEnrollment
      })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        lessonId: lessonId
      }
    })

    // Increment views count
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'Enrolled successfully',
      enrollment
    })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'Failed to enroll' },
      { status: 500 }
    )
  }
}

