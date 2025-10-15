'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, Clock, TrendingUp, Target, Sparkles, Trash2, AlertCircle } from 'lucide-react'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'

export const dynamic = 'force-dynamic'

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
  
  const sessionData = session?.data
  const status = session?.status

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (sessionData?.user?.id) {
      fetchLessons()
    }
  }, [sessionData])

  // Auto-refresh when user comes back to dashboard (e.g. from course page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessionData?.user?.id) {
        fetchLessons()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [sessionData])

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

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBanner />
      <HeaderNew />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section - Factory.ai Style */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-sm text-zinc-500 font-bold uppercase tracking-[0.2em]">Dashboard</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
            Welcome back, <span className="text-orange-500">{sessionData.user.name || 'Learner'}</span>
          </h1>
          <p className="text-zinc-400 text-lg">Track your progress and continue your learning journey</p>
        </div>

        {/* Stats Cards - Factory.ai Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-6 rounded-xl">
            <div className="absolute top-0 left-0 w-16 h-16 bg-orange-600/5 rounded-tl-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-600/10 border-2 border-orange-500/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{lessons.length}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Courses</div>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full">
                <div className="h-full bg-orange-500 w-full rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-6 rounded-xl">
            <div className="absolute top-0 left-0 w-16 h-16 bg-orange-600/5 rounded-tl-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-600/10 border-2 border-green-500/20 rounded-lg">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{completedSections}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Sections Done</div>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full">
                <div className="h-full bg-green-500 w-full rounded-full"></div>
              </div>
              <div className="mt-2 text-xs text-zinc-600 font-medium">
                {totalSections} total sections
              </div>
            </div>
          </div>

          <div className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-6 rounded-xl">
            <div className="absolute top-0 left-0 w-16 h-16 bg-orange-600/5 rounded-tl-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-600/10 border-2 border-orange-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{totalDuration}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Minutes</div>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full">
                <div className="h-full bg-orange-500 w-full rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-6 rounded-xl">
            <div className="absolute top-0 left-0 w-16 h-16 bg-orange-600/5 rounded-tl-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-600/10 border-2 border-orange-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-4xl font-black text-white">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Overall Progress</div>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-zinc-600 font-medium">
                {completedLessons} of {lessons.length} courses completed
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Factory.ai CTA */}
        <div className="mb-12">
          <Link href="/ai-tutor">
            <button className="group relative w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 transition-all duration-300 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30">
              <div className="relative flex items-center justify-center gap-3">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-lg">Create New Course</span>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </button>
          </Link>
        </div>

        {/* Lessons Grid - Factory.ai Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white tracking-tight">Your Courses</h2>
            <div className="text-sm text-zinc-500 font-semibold">
              {lessons.length} {lessons.length === 1 ? 'course' : 'courses'}
            </div>
          </div>
          
          {lessons.length === 0 ? (
            <div className="relative bg-zinc-900 border-2 border-zinc-800 p-16 text-center overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-orange-600/5 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-600/5 rounded-br-2xl"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-zinc-800 border-2 border-zinc-700 mx-auto mb-6 flex items-center justify-center rounded-xl">
                  <BookOpen className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">No courses yet</h3>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Start your learning journey by creating your first AI-powered course
                </p>
                <Link href="/ai-tutor">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 border-2 border-orange-400/50 hover:border-orange-400 transition-all rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30">
                    Create Your First Course
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-6 overflow-hidden rounded-xl"
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-600/10 to-transparent rounded-tr-xl"></div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteConfirm({ id: lesson.id, title: lesson.title })
                    }}
                    className="absolute top-4 right-4 z-10 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Delete course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <Link href={`/course/${lesson.id}`} className="block">
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-600/10 border-2 border-orange-500/20 group-hover:border-orange-500/40 transition-all rounded-lg">
                          <BookOpen className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 border rounded-lg ${
                          lesson.difficulty === 'beginner' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                          lesson.difficulty === 'intermediate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                          {lesson.difficulty.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                        {lesson.title}
                      </h3>
                      
                      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                        {lesson.description}
                      </p>

                      {/* Progress Bar for Course */}
                      {lesson.totalSections && lesson.totalSections > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-500 font-medium">Progress</span>
                            <span className="text-xs text-zinc-400 font-bold">
                              {lesson.completedSections}/{lesson.totalSections} sections
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 rounded-full"
                              style={{ width: `${lesson.completionPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-800 group-hover:border-orange-500/30 transition-colors">
                        <div className="flex items-center gap-2 text-zinc-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration} min</span>
                        </div>
                        
                        {lesson.completed ? (
                          <span className="text-green-400 font-bold text-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            DONE
                          </span>
                        ) : (
                          <span className="text-orange-400 font-bold text-sm group-hover:text-orange-300 flex items-center gap-1">
                            CONTINUE
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
            className="bg-zinc-900 border-2 border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-black text-white text-center mb-3">
              Delete Course?
            </h3>

            {/* Message */}
            <p className="text-zinc-400 text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-white font-bold text-center mb-4 px-4">
              "{deleteConfirm.title}"
            </p>
            <p className="text-sm text-red-400 text-center mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              This action cannot be undone. All progress and content will be permanently deleted.
            </p>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-2">
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
                className={`w-full px-4 py-3 bg-zinc-800 border-2 ${
                  passwordError 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-zinc-700 focus:border-orange-500'
                } text-white placeholder:text-zinc-500 rounded-xl outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null)
                  setPassword('')
                  setPasswordError('')
                }}
                disabled={isDeleting || isVerifying}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 hover:border-zinc-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLesson(deleteConfirm.id)}
                disabled={isDeleting || isVerifying || !password.trim()}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 border-2 border-red-400/50 hover:border-red-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting || isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isVerifying ? 'Verifying...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
