import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

// Credit package pricing
const CREDIT_PACKAGES = {
  'initial_bonus': { price: 0, credits: 500 },
  'course_clone': { price: 2.99, credits: 30 },
  'starter_pack': { price: 9.99, credits: 100 },
  'pro_pack': { price: 39.99, credits: 500 },
  'enterprise_pack': { price: 129.99, credits: 2000 },
  'admin_add': { price: 0, credits: 0 }, // Free admin additions
}

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

    // Get period from query params
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'
    
    // Calculate date range
    let dateFilter: Date
    let days: number
    
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      days = 7
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      days = 30
    } else {
      dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      days = 365
    }

    // Fetch real transactions from database
    const [allTransactions, periodTransactions, totalUsers] = await Promise.all([
      // All transactions ever
      prisma.creditTransaction.findMany({
        where: {
          type: { in: ['purchase', 'course_clone'] } // Only revenue-generating transactions
        },
        select: {
          amount: true,
          type: true,
          packageName: true,
          price: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Transactions in selected period
      prisma.creditTransaction.findMany({
        where: {
          createdAt: { gte: dateFilter },
          type: { in: ['purchase', 'course_clone'] }
        },
        select: {
          amount: true,
          type: true,
          price: true,
          createdAt: true
        }
      }),
      // Total users count
      prisma.user.count()
    ])

    // Calculate total revenue from real transactions
    const totalRevenue = allTransactions.reduce((sum, tx) => {
      // For purchases, use the price; for course_clone, calculate from amount
      if (tx.price) {
        return sum + tx.price
      } else if (tx.type === 'course_clone') {
        // Course clone costs 30 credits = $2.99
        return sum + 2.99
      }
      return sum
    }, 0)

    // Calculate period revenue
    const periodRevenue = periodTransactions.reduce((sum, tx) => {
      if (tx.price) {
        return sum + tx.price
      } else if (tx.type === 'course_clone') {
        return sum + 2.99
      }
      return sum
    }, 0)

    // Group transactions by date for timeline
    const revenueByDate: Map<string, { revenue: number; sales: number }> = new Map()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      revenueByDate.set(dateStr, { revenue: 0, sales: 0 })
    }

    // Populate with real transaction data
    periodTransactions.forEach(tx => {
      const dateStr = new Date(tx.createdAt).toISOString().split('T')[0]
      const existing = revenueByDate.get(dateStr)
      if (existing) {
        const revenue = tx.price || (tx.type === 'course_clone' ? 2.99 : 0)
        existing.revenue += revenue
        existing.sales += 1
      }
    })

    const revenueByPeriod = Array.from(revenueByDate.entries()).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      sales: data.sales
    }))

    // Count transactions by type for top products
    const productCounts: Map<string, { revenue: number; sales: number }> = new Map()
    
    allTransactions.forEach(tx => {
      const productName = tx.packageName || (tx.type === 'course_clone' ? 'Course Clone (30 Credits)' : 'Other')
      const existing = productCounts.get(productName) || { revenue: 0, sales: 0 }
      const revenue = tx.price || (tx.type === 'course_clone' ? 2.99 : 0)
      
      existing.revenue += revenue
      existing.sales += 1
      productCounts.set(productName, existing)
    })

    // Convert to array and sort by revenue
    const topProducts = Array.from(productCounts.entries())
      .map(([name, data]) => ({
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        sales: data.sales
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)

    // If no real transactions yet, show placeholder products
    if (topProducts.length === 0) {
      topProducts.push(
        { name: 'Pro Pack (500 Credits)', revenue: 0, sales: 0 },
        { name: 'Starter Pack (100 Credits)', revenue: 0, sales: 0 },
        { name: 'Course Clone (30 Credits)', revenue: 0, sales: 0 },
        { name: 'Enterprise (2000 Credits)', revenue: 0, sales: 0 }
      )
    }

    // Calculate credit-only sales (course clones)
    const creditSales = allTransactions
      .filter(tx => tx.type === 'course_clone')
      .reduce((sum, tx) => sum + 2.99, 0)

    // Calculate average order value
    const averageOrderValue = allTransactions.length > 0
      ? totalRevenue / allTransactions.length
      : 0

    // Calculate conversion rate (users who made purchases)
    const uniqueBuyers = new Set(allTransactions.map(tx => tx.user.id)).size
    const conversionRate = totalUsers > 0
      ? Math.round((uniqueBuyers / totalUsers) * 100)
      : 0

    // Calculate growth (compare current period with previous period)
    const previousPeriodStart = new Date(dateFilter.getTime() - (Date.now() - dateFilter.getTime()))
    const previousPeriodTransactions = await prisma.creditTransaction.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: dateFilter
        },
        type: { in: ['purchase', 'course_clone'] }
      },
      select: {
        price: true,
        type: true
      }
    })

    const previousPeriodRevenue = previousPeriodTransactions.reduce((sum, tx) => {
      if (tx.price) return sum + tx.price
      if (tx.type === 'course_clone') return sum + 2.99
      return sum
    }, 0)

    const growthPercentage = previousPeriodRevenue > 0
      ? Math.round(((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : periodRevenue > 0 ? 100 : 0

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(periodRevenue * 100) / 100,
      weeklyRevenue: Math.round(periodRevenue * 100) / 100,
      creditSales: Math.round(creditSales * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      conversionRate,
      revenueByPeriod,
      topProducts,
      revenueGrowth: {
        percentage: Math.abs(growthPercentage),
        trend: growthPercentage >= 0 ? 'up' as const : 'down' as const
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching revenue stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
