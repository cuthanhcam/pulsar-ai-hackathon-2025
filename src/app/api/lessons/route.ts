import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        topic: true,
        difficulty: true,
        duration: true,
        completed: true,
        createdAt: true,
        modules: {
          select: {
            id: true,
            sections: {
              select: {
                id: true,
                completed: true
              }
            }
          }
        }
      }
    })

    // Calculate completion for each lesson based on sections
    const lessonsWithProgress = lessons.map(lesson => {
      const totalSections = lesson.modules.reduce((acc, mod) => {
        return acc + (mod.sections?.length || 0)
      }, 0)
      
      const completedSections = lesson.modules.reduce((acc, mod) => {
        return acc + (mod.sections?.filter(s => s.completed).length || 0)
      }, 0)
      
      const completionPercentage = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100) 
        : 0
      
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        topic: lesson.topic,
        difficulty: lesson.difficulty,
        duration: lesson.duration,
        completed: completionPercentage === 100, // Course is completed when all sections are done
        createdAt: lesson.createdAt,
        totalSections,
        completedSections,
        completionPercentage
      }
    })

    return NextResponse.json({ lessons: lessonsWithProgress })

  } catch (error) {
    console.error('Fetch lessons error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}
