'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Users,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Zap,
  Award,
  Loader2,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalCourses: number
    totalQuizzes: number
    completionRate: number
    averageScore: number
    activeToday: number
  }
  userGrowth: Array<{
    date: string
    count: number
  }>
  coursesByDifficulty: Array<{
    difficulty: string
    count: number
  }>
  popularTopics: Array<{
    topic: string
    count: number
  }>
  quizPerformance: {
    averageScore: number
    passRate: number
    totalAttempts: number
  }
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (res.ok) {
        const result = await res.json()
        setData(result.data)
      } else if (res.status === 403) {
        alert('Access denied. Admin role required.')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">Platform Analytics</h1>
            <p className="text-xs sm:text-sm text-zinc-400">Comprehensive insights and performance metrics</p>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex items-center gap-2 bg-zinc-800/30 p-1 rounded-lg">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : data && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-4 mb-6">
            <MetricCard
              icon={<Users />}
              label="Total Users"
              value={data.overview.totalUsers.toLocaleString()}
              color="blue"
            />
            <MetricCard
              icon={<BookOpen />}
              label="Total Courses"
              value={data.overview.totalCourses.toLocaleString()}
              color="purple"
            />
            <MetricCard
              icon={<Trophy />}
              label="Quizzes Taken"
              value={data.overview.totalQuizzes.toLocaleString()}
              color="green"
            />
            <MetricCard
              icon={<Target />}
              label="Completion Rate"
              value={`${data.overview.completionRate}%`}
              color="orange"
            />
            <MetricCard
              icon={<Award />}
              label="Avg Score"
              value={`${data.overview.averageScore}%`}
              color="yellow"
            />
            <MetricCard
              icon={<Zap />}
              label="Active Today"
              value={data.overview.activeToday.toLocaleString()}
              color="cyan"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* User Growth Chart */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-white">User Growth</h2>
              </div>
              <div className="space-y-2">
                {data.userGrowth.slice(-7).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 w-16 sm:w-20">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-zinc-800/30 rounded-full h-6 sm:h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (item.count / Math.max(...data.userGrowth.map(i => i.count))) * 100)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses by Difficulty */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Courses by Difficulty</h2>
              </div>
              <div className="space-y-3">
                {data.coursesByDifficulty.map((item, index) => {
                  const total = data.coursesByDifficulty.reduce((sum, i) => sum + i.count, 0)
                  const percentage = Math.round((item.count / total) * 100)
                  const colors = ['from-green-500 to-green-600', 'from-yellow-500 to-yellow-600', 'from-orange-500 to-orange-600', 'from-red-500 to-red-600']
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-300 capitalize">{item.difficulty}</span>
                        <span className="text-sm font-bold text-white">{percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-800/30 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Popular Topics */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Popular Topics</h2>
              </div>
              <div className="space-y-2">
                {data.popularTopics.slice(0, 8).map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 bg-zinc-800/20 border border-zinc-800/30 rounded-lg hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xs">
                        #{index + 1}
                      </div>
                      <span className="text-sm text-white font-medium truncate">{topic.topic}</span>
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                      <span className="text-xs sm:text-sm font-bold text-orange-400">{topic.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Performance */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Quiz Performance</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Pass Rate</span>
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{data.quizPerformance.passRate}%</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Average Score</span>
                    <Award className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{data.quizPerformance.averageScore}%</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Total Attempts</span>
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{data.quizPerformance.totalAttempts.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border rounded-lg sm:rounded-xl p-3 sm:p-4`}>
      <div className="text-zinc-400 w-5 h-5 sm:w-6 sm:h-6 mb-2 [&>svg]:w-full [&>svg]:h-full">{icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</h3>
      <p className="text-[10px] sm:text-xs text-zinc-400 leading-tight">{label}</p>
    </div>
  )
}
