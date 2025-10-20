'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react'

interface CreditStats {
  totalCreditsDistributed: number
  totalCreditsUsed: number
  activeUsers: number
  averageCreditsPerUser: number
  topSpenders: Array<{
    id: string
    name: string | null
    email: string
    credits: number
    used: number
  }>
  recentTransactions: Array<{
    id: string
    userId: string
    amount: number
    type: 'add' | 'deduct'
    reason: string
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }>
}

export default function AdminCreditsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<CreditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '7d' | '30d'>('30d')

  useEffect(() => {
    fetchCreditStats()
  }, [filter])

  const fetchCreditStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/credits?filter=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      } else if (res.status === 403) {
        alert('Access denied. Admin role required.')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching credit stats:', error)
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">Credits Management</h1>
            <p className="text-xs sm:text-sm text-zinc-400">Monitor credit distribution and usage</p>
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <StatsCard
              icon={<Coins className="w-5 h-5 sm:w-6 sm:h-6" />}
              label="Total Distributed"
              value={stats.totalCreditsDistributed.toLocaleString()}
              trend={<TrendingUp className="w-4 h-4" />}
              color="orange"
            />
            <StatsCard
              icon={<TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />}
              label="Total Used"
              value={stats.totalCreditsUsed.toLocaleString()}
              trend={<TrendingDown className="w-4 h-4" />}
              color="red"
            />
            <StatsCard
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              label="Active Users"
              value={stats.activeUsers.toLocaleString()}
              color="blue"
            />
            <StatsCard
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
              label="Avg Per User"
              value={Math.round(stats.averageCreditsPerUser).toLocaleString()}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Spenders */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                Top Credit Holders
              </h2>
              <div className="space-y-3">
                {stats.topSpenders.map((user, index) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-3 bg-zinc-800/30 border border-zinc-800/50 rounded-lg hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{user.name || 'Anonymous'}</p>
                      <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold text-sm">{Number(user.credits).toLocaleString()}</p>
                      <p className="text-zinc-500 text-xs">credits</p>
                    </div>
                  </div>
                ))}
                {stats.topSpenders.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Recent Transactions
              </h2>
              <div className="space-y-2">
                {stats.recentTransactions.slice(0, 8).map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-zinc-800/20 border border-zinc-800/30 rounded-lg text-xs sm:text-sm"
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      tx.type === 'add' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === 'add' ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{tx.user.name || tx.user.email}</p>
                      <p className="text-zinc-500 truncate text-[10px] sm:text-xs">{tx.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold ${tx.type === 'add' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'add' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-zinc-500 text-[9px] sm:text-[10px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recentTransactions.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string
  trend?: React.ReactNode
  color: 'orange' | 'red' | 'blue' | 'green'
}

function StatsCard({ icon, label, value, trend, color }: StatsCardProps) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  }[color]

  return (
    <div className={`bg-gradient-to-br ${colorClasses} backdrop-blur-md border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-zinc-400">{icon}</div>
        {trend && <div className="text-zinc-400">{trend}</div>}
      </div>
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1">{value}</h3>
      <p className="text-[10px] sm:text-xs lg:text-sm text-zinc-400 leading-tight">{label}</p>
    </div>
  )
}
