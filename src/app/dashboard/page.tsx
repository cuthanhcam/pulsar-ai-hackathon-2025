'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'
import { BookOpen, Plus, Clock, TrendingUp, Target, Sparkles, Trash2, AlertCircle, BarChart3, Search, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'

export const dynamic = 'force-dynamic'

// Lazy load canvas for better performance
const TechCanvas = dynamicImport(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

interface Lesson {
  id: string
  title: string
  description: string
  topic: string
  difficulty: string
  duration: number
  completed: boolean
  createdAt: string
  totalSections?: number
  completedSections?: number
  completionPercentage?: number
}

export default function DashboardPage() {
  const session = useSession()
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  
  const sessionData = session?.data
  const status = session?.status

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Defer canvas loading to improve initial render time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCanvas(true)
    }, 100) // Load canvas after 100ms to prioritize content

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (sessionData?.user?.id) {
      fetchLessons()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.user?.id])

  // Auto-refresh when user comes back to dashboard (e.g. from course page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessionData?.user?.id) {
        fetchLessons()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.user?.id])

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons)
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    // Validate password first
    if (!password.trim()) {
      setPasswordError('Please enter your password')
      return
    }

    setIsVerifying(true)
    setPasswordError('')

    try {
      // Verify password first
      const verifyResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        setPasswordError(errorData.error || 'Invalid password')
        setIsVerifying(false)
        return
      }

      // Password verified, proceed with deletion
      setIsDeleting(true)
      const deleteResponse = await fetch(`/api/lessons/${lessonId}/delete`, {
        method: 'DELETE',
      })

      if (deleteResponse.ok) {
        // Remove from state immediately
        setLessons(prev => prev.filter(l => l.id !== lessonId))
        setDeleteConfirm(null)
        setPassword('')
        setPasswordError('')
      } else {
        setPasswordError('Failed to delete lesson')
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      setPasswordError('Failed to delete lesson')
    } finally {
      setIsDeleting(false)
      setIsVerifying(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return null
  }

  const completedLessons = lessons.filter(l => l.completed).length
  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0)
  
  // Calculate total sections across all courses
  const totalSections = lessons.reduce((sum, l) => sum + (l.totalSections || 0), 0)
  const completedSections = lessons.reduce((sum, l) => sum + (l.completedSections || 0), 0)
  const overallProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  // Filter lessons based on search and difficulty
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || lesson.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  // Limit displayed lessons (show 10 by default, or all if showAll is true)
  const INITIAL_DISPLAY_COUNT = 10
  const displayedLessons = showAll ? filteredLessons : filteredLessons.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = filteredLessons.length > INITIAL_DISPLAY_COUNT

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Canvas Background - Deferred loading for performance */}
      {showCanvas && (
        <>
          <div className="fixed inset-0 z-0">
            <TechCanvas />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/85 to-zinc-950 pointer-events-none"></div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        <TopBanner />
        <HeaderNew />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section - Compact */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back, <span className="text-orange-500">{sessionData.user.name || 'Learner'}</span>
          </h1>
          <p className="text-zinc-400 text-sm">Track your progress and continue your learning journey</p>
        </div>

        {/* Stats & Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 hover:border-orange-500/50 transition-all duration-200 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-600/10 border border-orange-500/20 rounded-md">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-white">{lessons.length}</div>
              </div>
              <div className="text-xs text-zinc-500 font-medium">Total Courses</div>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg hover:border-orange-500/50 transition-all duration-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-600/10 border border-green-500/20 rounded-md">
                  <Target className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">{completedSections}</div>
              </div>
              <div className="text-xs text-zinc-500 font-medium">Sections Done</div>
              <div className="text-[10px] text-zinc-600 mt-1">{totalSections} total</div>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg hover:border-orange-500/50 transition-all duration-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-md">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">{totalDuration}</div>
              </div>
              <div className="text-xs text-zinc-500 font-medium">Total Minutes</div>
            </div>

            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg hover:border-orange-500/50 transition-all duration-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-600/10 border border-orange-500/20 rounded-md">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-white">{overallProgress}%</div>
              </div>
              <div className="text-xs text-zinc-500 font-medium">Overall Progress</div>
            </div>
          </div>

          {/* Circular Progress Chart */}
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-600/10 border border-orange-500/20 rounded-md">
                <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Progress Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: completedSections },
                    { name: 'Remaining', value: totalSections - completedSections }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#27272a" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2">
              <div className="text-lg font-bold text-orange-500">{overallProgress}%</div>
              <div className="text-[10px] text-zinc-500">{completedSections}/{totalSections} sections</div>
            </div>
          </div>

          {/* Course Progress Bar Chart */}
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-md">
                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-white">Course Progress</h3>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart 
                data={lessons.slice(0, 5).map(l => ({
                  name: l.title.substring(0, 15) + '...',
                  progress: l.completionPercentage || 0
                }))}
                margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                />
                <YAxis 
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="progress" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions - Compact */}
        <div className="mb-6">
          <Link href="/ai-tutor">
            <button className="group bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create New Course</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Courses Section with Search */}
        <div>
          {/* Header with Search and Filters */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h2 className="text-xl font-bold text-white">Your Courses</h2>
              <div className="text-xs text-zinc-500 font-medium">
                {filteredLessons.length} of {lessons.length} {lessons.length === 1 ? 'course' : 'courses'}
              </div>
            </div>

            {/* Search and Filter Bar */}
            {lessons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search courses by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg focus:border-orange-500 text-white placeholder:text-zinc-500 rounded-lg outline-none transition-colors text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Difficulty Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg focus:border-orange-500 text-white rounded-lg outline-none transition-colors text-sm appearance-none cursor-pointer hover:border-orange-500/50 min-w-[140px]"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Active Filters Badge */}
                {(searchQuery || difficultyFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setDifficultyFilter('all')
                      setShowAll(false)
                    }}
                    className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>
          
          {lessons.length === 0 ? (
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg p-12 text-center rounded-xl">
              <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
                <BookOpen className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No courses yet</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                Start your learning journey by creating your first AI-powered course
              </p>
              <Link href="/ai-tutor">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 transition-all rounded-lg text-sm">
                  Create Your First Course
                </button>
              </Link>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg p-12 text-center rounded-xl">
              <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
                <Search className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No courses found</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setDifficultyFilter('all')
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2.5 transition-all rounded-lg text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${
                filteredLessons.length === 1 ? 'grid-cols-1 max-w-md' :
                filteredLessons.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
                filteredLessons.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {displayedLessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="group relative bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-lg hover:border-orange-500/50 transition-all duration-200 rounded-lg overflow-hidden"
                >
                  <Link href={`/course/${lesson.id}`} className="block p-4 pr-12">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-600/10 border border-orange-500/20 group-hover:border-orange-500/40 transition-all rounded-md">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 border rounded-md ${
                          lesson.difficulty === 'beginner' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                          lesson.difficulty === 'intermediate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {lesson.difficulty.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      
                      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                        {lesson.description}
                      </p>

                      {/* Progress Bar for Course */}
                      {lesson.totalSections && lesson.totalSections > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-zinc-500 font-medium">Progress</span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {lesson.completedSections}/{lesson.totalSections}
                            </span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 rounded-full"
                              style={{ width: `${lesson.completionPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration} min</span>
                        </div>
                        
                        {lesson.completed ? (
                          <span className="text-green-400 font-semibold text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            DONE
                          </span>
                        ) : (
                          <span className="text-orange-400 font-semibold text-xs group-hover:text-orange-300 flex items-center gap-1">
                            CONTINUE
                            <span className="group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Delete button - Fixed position outside Link */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteConfirm({ id: lesson.id, title: lesson.title })
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {hasMore && !searchQuery && difficultyFilter === 'all' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {showAll ? (
                    <>
                      <span>Show Less</span>
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>View All Courses ({filteredLessons.length - INITIAL_DISPLAY_COUNT} more)</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal - Compact */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => {
            if (!isDeleting && !isVerifying) {
              setDeleteConfirm(null)
              setPassword('')
              setPasswordError('')
            }
          }}
        >
          <div 
            className="bg-zinc-900 border border-red-500/30 rounded-xl w-full max-w-md p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white text-center mb-2">
              Delete Course?
            </h3>

            {/* Message */}
            <p className="text-zinc-400 text-sm text-center mb-1">
              Are you sure you want to delete
            </p>
            <p className="text-white font-semibold text-sm text-center mb-3">
              "{deleteConfirm.title}"
            </p>
            <p className="text-xs text-red-400 text-center mb-4 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
              This action cannot be undone. All progress will be permanently deleted.
            </p>

            {/* Password Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-white mb-1.5">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isDeleting && !isVerifying) {
                    handleDeleteLesson(deleteConfirm.id)
                  }
                }}
                placeholder="Your account password"
                disabled={isDeleting || isVerifying}
                className={`w-full px-3 py-2 text-sm bg-zinc-800 border ${
                  passwordError 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-zinc-700 focus:border-orange-500'
                } text-white placeholder:text-zinc-500 rounded-lg outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                autoFocus
              />
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDeleteConfirm(null)
                  setPassword('')
                  setPasswordError('')
                }}
                disabled={isDeleting || isVerifying}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLesson(deleteConfirm.id)}
                disabled={isDeleting || isVerifying || !password.trim()}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 border border-red-400/50 hover:border-red-400 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isDeleting || isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isVerifying ? 'Verifying...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
