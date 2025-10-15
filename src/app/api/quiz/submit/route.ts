import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SubmissionAnswer {
  questionId: string
  selectedAnswer: number
}

/**
 * POST /api/quiz/submit
 * Submit and grade quiz answers
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { quizId, answers }: { quizId: string; answers: SubmissionAnswer[] } = await req.json()

    if (!quizId || !answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'Quiz ID and answers are required' },
        { status: 400 }
      )
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        lesson: true
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Grade answers
    let correctCount = 0
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      
      if (!question) {
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          correct: false,
          correctAnswer: -1
        }
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer
      if (isCorrect) correctCount++

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    })

    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= 70 // 70% passing score

    // Save quiz result
    const quizResult = await prisma.quizResult.create({
      data: {
        userId: session.user.id,
        quizId: quiz.id,
        score,
        answers: gradedAnswers,
        completedAt: new Date()
      }
    })

    // Update user progress
    const progress = await prisma.progress.findUnique({
      where: { userId: session.user.id }
    })

    if (progress) {
      const currentStreak = calculateStreak(progress.lastAccessedAt)
      
      await prisma.progress.update({
        where: { userId: session.user.id },
        data: {
          lessonsCompleted: passed ? { increment: 1 } : undefined,
          quizzesCompleted: { increment: 1 },
          currentStreak: currentStreak,
          longestStreak: Math.max(currentStreak, progress.longestStreak),
          lastAccessedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      result: {
        id: quizResult.id,
        score,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
        answers: gradedAnswers
      }
    })

  } catch (error) {
    console.error('[API] Submit quiz error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit quiz', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate learning streak
 * Returns the current streak count
 */
function calculateStreak(lastAccessedAt: Date | null): number {
  if (!lastAccessedAt) return 1

  const now = new Date()
  const daysSinceLastAccess = Math.floor(
    (now.getTime() - lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // If accessed today or yesterday, continue streak
  if (daysSinceLastAccess <= 1) {
    return 1 // Will be incremented by the existing streak
  }

  // Streak broken
  return 1
}

