import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { 
      lessonId, 
      sectionId, 
      sectionTitle, 
      questions, 
      answers, 
      score 
    } = body

    // Validate required fields
    if (!lessonId || !sectionId || !questions || !answers || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Quiz record
    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        sectionId,
        title: `${sectionTitle} - Quiz`,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            order: index
          }))
        }
      },
      include: {
        questions: true
      }
    })

    // Create QuizResult record
    const quizResult = await prisma.quizResult.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        score,
        answers: answers
      }
    })

    // Update user's progress
    await prisma.progress.upsert({
        where: { userId: session.user.id },
      update: {
          quizzesCompleted: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        quizzesCompleted: 1,
        lessonsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    })

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      resultId: quizResult.id,
      message: 'Quiz result saved successfully'
    })

  } catch (error) {
    console.error('Error saving quiz result:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz result' },
      { status: 500 }
    )
  }
}
