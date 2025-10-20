import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get filter from query params
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') || '30d'
    
    // Calculate date filter
    let dateFilter: Date | undefined
    if (filter === '7d') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    } else if (filter === '30d') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch credit statistics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        createdAt: true
      },
      where: dateFilter ? {
        createdAt: { gte: dateFilter }
      } : undefined
    })

    // Calculate stats
    const totalCreditsDistributed = users.reduce((sum, u) => sum + Number(u.credits), 0)
    const activeUsers = users.filter(u => Number(u.credits) > 0).length
    const averageCreditsPerUser = users.length > 0 ? totalCreditsDistributed / users.length : 0

    // Get top spenders (users with most credits)
    const topSpenders = users
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        credits: Number(u.credits),
        used: 0 // We'll calculate this from quiz submissions
      }))
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 10)

    // Fetch real credit transactions
    const recentTransactions = await prisma.creditTransaction.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      where: dateFilter ? {
        createdAt: { gte: dateFilter }
      } : undefined,
      select: {
        id: true,
        userId: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    // Calculate total credits used (negative transactions)
    const totalCreditsUsed = await prisma.creditTransaction.aggregate({
      where: {
        amount: { lt: 0 },
        ...(dateFilter ? { createdAt: { gte: dateFilter } } : {})
      },
      _sum: {
        amount: true
      }
    })
    
    const creditsUsed = Math.abs(totalCreditsUsed._sum.amount || 0)
    
    // Format transactions for frontend
    const formattedTransactions = recentTransactions.map(tx => ({
      id: tx.id,
      userId: tx.userId,
      amount: tx.amount,
      type: tx.amount > 0 ? 'add' as const : 'deduct' as const,
      reason: tx.description,
      createdAt: tx.createdAt.toISOString(),
      user: {
        name: tx.user.name,
        email: tx.user.email
      }
    }))
    
    const stats = {
      totalCreditsDistributed,
      totalCreditsUsed: creditsUsed,
      activeUsers,
      averageCreditsPerUser,
      topSpenders,
      recentTransactions: formattedTransactions
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching credit stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

