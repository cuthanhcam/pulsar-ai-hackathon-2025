'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  Users,
  CreditCard,
  Coins,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Target,
  Wallet,
  ShoppingCart,
  Award
} from 'lucide-react'

interface RevenueStats {
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  creditSales: number
  averageOrderValue: number
  conversionRate: number
  revenueByPeriod: Array<{
    date: string
    revenue: number
    sales: number
  }>
  topProducts: Array<{
    name: string
    revenue: number
    sales: number
  }>
  revenueGrowth: {
    percentage: number
    trend: 'up' | 'down'
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchRevenueStats()
  }, [period])

  const fetchRevenueStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/revenue?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      } else if (res.status === 403) {
        alert('Access denied. Admin role required.')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              💰 Revenue Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Financial overview and revenue analytics
            </p>
          </div>
          
          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-zinc-800/30 p-1 rounded-lg">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all capitalize ${
                  period === p
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <RevenueCard
              icon={<DollarSign />}
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              trend={stats.revenueGrowth.trend}
              percentage={stats.revenueGrowth.percentage}
              color="green"
            />
            <RevenueCard
              icon={<Calendar />}
              label={period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'}
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              color="blue"
            />
            <RevenueCard
              icon={<CreditCard />}
              label="Credit Sales"
              value={`$${stats.creditSales.toLocaleString()}`}
              color="purple"
            />
            <RevenueCard
              icon={<Target />}
              label="Avg Order Value"
              value={`$${stats.averageOrderValue.toFixed(2)}`}
              color="orange"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Revenue Timeline */}
            <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Revenue Timeline
                </h2>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Total Revenue</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {stats.revenueByPeriod.slice(-10).map((item, index) => {
                  const maxRevenue = Math.max(...stats.revenueByPeriod.map(i => i.revenue))
                  const percentage = (item.revenue / maxRevenue) * 100
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-zinc-400">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: period === 'year' ? 'numeric' : undefined
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{item.sales} sales</span>
                          <span className="text-white font-bold">${item.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800/30 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 relative"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.conversionRate}%</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                    style={{ width: `${stats.conversionRate}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/admin/users"
                    className="flex items-center justify-between p-2 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-400 group-hover:text-orange-400" />
                      <span className="text-xs sm:text-sm text-zinc-300">Manage Users</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                  </Link>
                  <Link
                    href="/admin/credits"
                    className="flex items-center justify-between p-2 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-zinc-400 group-hover:text-orange-400" />
                      <span className="text-xs sm:text-sm text-zinc-300">Credit Management</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="flex items-center justify-between p-2 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-zinc-400 group-hover:text-orange-400" />
                      <span className="text-xs sm:text-sm text-zinc-300">Analytics</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products/Packages */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Top Revenue Sources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topProducts.map((product, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 hover:border-orange-500/50 transition-all group"
                >
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="mb-3">
                    <h3 className="text-white font-bold text-base mb-1">{product.name}</h3>
                    <p className="text-xs text-zinc-500">{product.sales} sales</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-400">
                      ${product.revenue.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500">revenue</span>
                  </div>
                  <div className="mt-3 w-full bg-zinc-700/30 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(product.revenue / Math.max(...stats.topProducts.map(p => p.revenue))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface RevenueCardProps {
  icon: React.ReactNode
  label: string
  value: string
  trend?: 'up' | 'down'
  percentage?: number
  color: 'green' | 'blue' | 'purple' | 'orange'
}

function RevenueCard({ icon, label, value, trend, percentage, color }: RevenueCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  }[color]

  return (
    <div className={`bg-gradient-to-br ${colorClasses} backdrop-blur-md border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="text-zinc-400 w-5 h-5 sm:w-6 sm:h-6 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
          {trend && percentage !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {percentage}%
            </div>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">{value}</h3>
        <p className="text-[10px] sm:text-xs lg:text-sm text-zinc-400 leading-tight">{label}</p>
      </div>
    </div>
  )
}
