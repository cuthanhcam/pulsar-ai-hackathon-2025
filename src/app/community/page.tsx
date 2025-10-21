'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useSession } from 'next-auth/react'
import { Search, MessageCircle, Share2, BookOpen, Eye, Clock, Plus, Loader2, X, Send, TrendingUp, Users, Sparkles, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import HeaderNew from '@/components/HeaderNew'
import ReactionPicker, { ReactionCounter, ReactionType } from '@/components/ReactionPicker'
import CommentSection from '@/components/CommentSection'
import MessengerModal from '@/components/MessengerModal'
import UserProfileModal from '@/components/UserProfileModal'

const TechCanvas = dynamic(() => import('@/components/TechCanvas'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-zinc-950" />
})

interface CoursePost {
  id: string
  userId: string
  lessonId: string
  caption: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  lesson: {
    id: string
    title: string
    description: string | null
    topic: string
    difficulty: string
    duration: number
    views: number
    _count?: {
      modules?: number
      enrollments?: number
    }
  }
  _count?: {
    likes?: number
    comments?: number
  }
  userReaction?: ReactionType | null
}

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<CoursePost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCanvas, setShowCanvas] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [messengerRecipient, setMessengerRecipient] = useState<{ id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)

  // Create Post
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const [showHelperBanner, setShowHelperBanner] = useState(true)

  // Conversation Contacts (only people user has chatted with)
  const [conversationContacts, setConversationContacts] = useState<any[]>([])

  // Save Course Modal
  const [showSaveCourseModal, setShowSaveCourseModal] = useState(false)
  const [selectedCourseToSave, setSelectedCourseToSave] = useState<{
    lessonId: string
    title: string
    userId: string
  } | null>(null)
  const [savingCourse, setSavingCourse] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const timer = setTimeout(() => setShowCanvas(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check if user has dismissed the helper banner before
    const dismissed = localStorage.getItem('community_helper_dismissed_v2')
    if (dismissed) {
      setShowHelperBanner(false)
    }
  }, [])

  // ===== ALL CALLBACKS MUST BE BEFORE RETURNS =====
  const dismissHelperBanner = () => {
    setShowHelperBanner(false)
    localStorage.setItem('community_helper_dismissed_v2', 'true')
  }

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/community/posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyCourses = useCallback(async () => {
    setLoadingCourses(true)
    try {
      const res = await fetch('/api/lessons')
      if (res.ok) {
        const data = await res.json()
        setMyCourses(data.lessons || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }, [])

  const handleCreatePost = useCallback(async () => {
    if (!selectedCourse || !caption.trim() || posting) return

    setPosting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: selectedCourse,
          caption: caption.trim()
        })
      })

      if (res.ok) {
        setShowCreatePost(false)
        setSelectedCourse('')
        setCaption('')
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }, [selectedCourse, caption, posting, fetchPosts])

  const handleReact = useCallback(async (postId: string, reactionType: ReactionType) => {
    try {
      // Optimistic update - update UI immediately
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? {
                ...post,
                userReaction: post.userReaction === reactionType ? null : reactionType
              }
            : post
        )
      )

      const res = await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      })

      if (!res.ok) {
        // Revert on error
        fetchPosts()
      }
    } catch (error) {
      console.error('Error reacting:', error)
      // Revert on error
      fetchPosts()
    }
  }, [fetchPosts])

  const handleCourseClick = useCallback((post: CoursePost) => {
    // Check if it's user's own course
    if (post.userId === session?.user?.id) {
      // User's own course - open directly
      router.push(`/course/${post.lessonId}`)
    } else {
      // Someone else's course - show save modal
      setSelectedCourseToSave({
        lessonId: post.lessonId,
        title: post.lesson.title,
        userId: post.userId
      })
      setShowSaveCourseModal(true)
    }
  }, [session, router])

  const handleSaveCourse = useCallback(async () => {
    if (!selectedCourseToSave || savingCourse) return

    setSavingCourse(true)
    try {
      console.log('[Community] Cloning course:', selectedCourseToSave.lessonId)
      
      const res = await fetch('/api/lessons/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: selectedCourseToSave.lessonId })
      })

      console.log('[Community] Clone response status:', res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[Community] Clone failed:', errorData)
        
        // Handle insufficient credits (402)
        if (res.status === 402) {
          const toastDiv = document.createElement('div')
          toastDiv.className = 'fixed top-20 right-4 z-[9999] bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-xl border border-red-400 max-w-md'
          toastDiv.innerHTML = `
            <div class="flex items-start gap-3">
              <div class="text-2xl">💳</div>
              <div>
                <div class="font-bold mb-1">❌ Không đủ Credits!</div>
                <div class="text-sm">${errorData.message || 'Bạn cần 30 credits để lưu khóa học này.'}</div>
                ${errorData.current !== undefined ? `<div class="text-xs mt-1 opacity-80">Hiện tại: ${errorData.current} credits</div>` : ''}
              </div>
            </div>
          `
          document.body.appendChild(toastDiv)
          setTimeout(() => toastDiv.remove(), 5000)
          
          setShowSaveCourseModal(false)
          setSelectedCourseToSave(null)
          setSavingCourse(false)
          return
        }
        
        // Show general error toast
        const errorMsg = errorData.error || 'Không thể lưu khóa học. Vui lòng thử lại!'
        const toastDiv = document.createElement('div')
        toastDiv.className = 'fixed top-20 right-4 z-[9999] bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl border border-red-400'
        toastDiv.textContent = `❌ ${errorMsg}`
        document.body.appendChild(toastDiv)
        setTimeout(() => toastDiv.remove(), 3000)
        
        setSavingCourse(false)
        return
      }

      const data = await res.json()
      console.log('[Community] Course cloned successfully:', data)

      if (!data.lesson || !data.lesson.id) {
        console.error('[Community] Invalid response data:', data)
        throw new Error('Invalid response: missing lesson ID')
      }

      setShowSaveCourseModal(false)
      setSelectedCourseToSave(null)
      
      // Show success toast with credits info
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-20 right-4 z-[9999] bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-xl border border-orange-400 max-w-md'
      
      const creditsInfo = data.credits
      const creditsHtml = creditsInfo && creditsInfo.cost > 0 
        ? `<div class="text-xs mt-1 opacity-90">💳 -${creditsInfo.cost} credits • Còn lại: ${creditsInfo.remaining} credits</div>`
        : ''
      
      successDiv.innerHTML = `
        <div>
          <div class="flex items-center gap-2 font-bold mb-1">
            <span>✅</span>
            <span>Đã lưu khóa học!</span>
          </div>
          <div class="text-sm">Đang chuyển hướng...</div>
          ${creditsHtml}
        </div>
      `
      document.body.appendChild(successDiv)
      
      // Navigate to the cloned course
      setTimeout(() => {
        router.push(`/course/${data.lesson.id}`)
        successDiv.remove()
      }, 2000)
      
    } catch (error) {
      console.error('[Community] Error saving course:', error)
      
      // Show error toast
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-20 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl border border-red-400'
      errorDiv.textContent = '❌ Có lỗi xảy ra. Vui lòng thử lại!'
      document.body.appendChild(errorDiv)
      setTimeout(() => errorDiv.remove(), 3000)
      
      setSavingCourse(false)
    }
  }, [selectedCourseToSave, savingCourse, router])

  const fetchConversationContacts = useCallback(async () => {
    if (!session) return
    
    try {
      const res = await fetch('/api/messenger/conversations')
      if (res.ok) {
        const data = await res.json()
        const conversations = data.conversations || []
        
        // Extract unique contacts from conversations
        const contacts = conversations
          .map((conv: any) => {
            // Find the other user in the conversation
            const otherUser = conv.participants?.find((p: any) => p?.user?.id !== session.user?.id)?.user
            return otherUser
          })
          .filter((user: any) => user && user.id) // Filter out null/undefined
        
        setConversationContacts(contacts)
      }
    } catch (error) {
      console.error('Error fetching conversation contacts:', error)
    }
  }, [session])

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Fetch conversation contacts on mount
  useEffect(() => {
    if (session) {
      fetchConversationContacts()
    }
  }, [session, fetchConversationContacts])

  // Fetch user's courses when opening create post modal
  useEffect(() => {
    if (showCreatePost && session) {
      fetchMyCourses()
    }
  }, [showCreatePost, session, fetchMyCourses])

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-orange-400 to-orange-500'
      case 'intermediate': return 'from-orange-500 to-orange-600'
      case 'advanced': return 'from-orange-600 to-orange-700'
      case 'expert': return 'from-orange-700 to-orange-800'
      default: return 'from-zinc-500 to-zinc-600'
    }
  }, [])

  // Memoize filtered posts to avoid re-filtering on every render
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    
    const lowerQuery = searchQuery.toLowerCase()
    return posts.filter(post => 
      post.lesson.title.toLowerCase().includes(lowerQuery) ||
      post.lesson.topic.toLowerCase().includes(lowerQuery) ||
      post.user.name?.toLowerCase().includes(lowerQuery)
    )
  }, [posts, searchQuery])

  // Memoize trending posts - sorted by likes, top 10
  const trendingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b._count?.likes || 0) - (a._count?.likes || 0))
      .slice(0, 10)
  }, [posts])

  // ===== EARLY RETURNS AFTER ALL HOOKS =====
  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  return (
    <>
      <HeaderNew />
      <div className="min-h-screen bg-zinc-950 relative">
        {/* Canvas Background */}
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
          <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Header Section - Redesigned - Compact on Mobile */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse"></div>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase tracking-widest">Community Hub</span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4 lg:gap-6">
                <div className="space-y-1 sm:space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold">
                    <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                      Learning
                    </span>
                    {' '}
                    <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent">
                      Community
                    </span>
                  </h1>
                  <p className="text-zinc-400 text-xs sm:text-sm lg:text-base max-w-2xl hidden sm:block">
                    Share your journey, discover amazing courses, and connect with passionate learners worldwide
                  </p>
                </div>
                {session && (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="group relative px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 rounded-lg sm:rounded-xl font-bold text-white text-sm shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-2">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Share Course</span>
                      <span className="sm:hidden">Share</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Main Grid - Compact spacing on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              {/* Left Sidebar - Stats - Redesigned - Hidden on Mobile */}
              <div className="hidden lg:block lg:col-span-3 space-y-5">
                {/* Quick Stats */}
                <div className="group bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-orange-500/10">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Live Stats</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="group/item p-3 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-orange-500/30 rounded-xl transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg group-hover/item:scale-110 transition-transform">
                            <Users className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-zinc-300">Total Posts</span>
                        </div>
                      </div>
                      <span className="text-2xl font-extrabold text-white ml-14">{posts.length}</span>
                    </div>
                    <div className="group/item p-3 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-orange-500/30 rounded-xl transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg group-hover/item:scale-110 transition-transform">
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-zinc-300">Today</span>
                        </div>
                      </div>
                      <span className="text-2xl font-extrabold text-white ml-14">
                        {posts.filter(p => {
                          const hours = (new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60)
                          return hours < 24
                        }).length}
                      </span>
                    </div>
                    <div className="group/item p-3 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-orange-500/30 rounded-xl transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg group-hover/item:scale-110 transition-transform">
                            <BookOpen className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-zinc-300">Courses</span>
                        </div>
                      </div>
                      <span className="text-2xl font-extrabold text-white ml-14">{new Set(posts.map(p => p.lessonId)).size}</span>
                    </div>
                  </div>
                </div>

                {/* Popular Topics */}
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Trending Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(posts.map(p => p.lesson.topic))).slice(0, 6).map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSearchQuery(topic)}
                        className="px-4 py-2 bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 hover:from-orange-500/20 hover:to-orange-600/20 border border-zinc-700/50 hover:border-orange-500/50 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center - Feed - Redesigned - Full width on Mobile */}
              <div className="lg:col-span-6 space-y-4 lg:space-y-5">
                {/* Helper Banner - Redesigned - Hidden on Mobile for space */}
                {session && posts.length > 0 && showHelperBanner && (
                  <div className="hidden sm:block relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-600/10 to-orange-500/10 border border-orange-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl shadow-orange-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                            💬 Connect with the Community
                            <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded-full text-[10px] font-semibold text-orange-400">NEW</span>
                          </h3>
                          <p className="text-sm text-zinc-300">
                            Three easy ways to start chatting:
                          </p>
                        </div>
                        <div className="space-y-2 text-sm text-zinc-300">
                          <div className="flex items-start gap-2">
                            <span className="text-orange-400 font-bold">1.</span>
                            <span>Click <strong className="text-white">💬 Messenger icon</strong> in header → Find People tab</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-orange-400 font-bold">2.</span>
                            <span>Press <strong className="text-white">Message button</strong> on any post</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-orange-400 font-bold">3.</span>
                            <span>Browse <strong className="text-white">Active Members</strong> in the sidebar</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={dismissHelperBanner}
                        className="p-2 hover:bg-orange-500/20 rounded-lg transition-all flex-shrink-0 group"
                        title="Dismiss"
                      >
                        <X className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Search - Redesigned - Compact on Mobile */}
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4">
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts, courses..."
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-2.5 sm:py-3.5 bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 focus:border-orange-500/50 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Create - Redesigned - Hidden on Mobile (use header button) */}
                {session && (
                  <div className="hidden sm:block bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl shadow-2xl p-5 transition-all duration-300">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-orange-500/30">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="flex-1 text-left px-5 py-3.5 bg-zinc-800/50 hover:bg-zinc-800/70 border border-zinc-700/50 hover:border-orange-500/50 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                      >
                        What course did you complete today? Share your journey...
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                    {filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        className="group/post bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-orange-500/10"
                      >
                        {/* Post Header - Redesigned - Compact on Mobile */}
                        <div className="p-3 sm:p-5 flex items-center justify-between border-b border-zinc-800/50">
                          <div className="flex items-center gap-2.5 sm:gap-4">
                            <button
                              onClick={() => setViewingUserId(post.userId)}
                              className="relative group/avatar"
                              title="View profile"
                            >
                              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg shadow-orange-500/30 group-hover/avatar:scale-110 group-hover/avatar:shadow-xl group-hover/avatar:shadow-orange-500/50 transition-all duration-300 cursor-pointer">
                                {post.user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                            </button>
                            <div className="space-y-0.5">
                              <button
                                onClick={() => setViewingUserId(post.userId)}
                                className="font-bold text-white text-sm sm:text-base hover:text-orange-400 transition-colors text-left flex items-center gap-2"
                              >
                                {post.user.name || 'Anonymous'}
                              </button>
                              <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">{timeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          {session?.user?.id !== post.userId && (
                            <button
                              onClick={() => setMessengerRecipient({ id: post.userId, name: post.user.name || 'User' })}
                              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-zinc-800/50 to-zinc-800/30 hover:from-orange-500/20 hover:to-orange-600/20 border border-zinc-700/50 hover:border-orange-500/50 rounded-lg sm:rounded-xl transition-all duration-300 group/msg hover:shadow-lg hover:shadow-orange-500/20"
                              title="Send message"
                            >
                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover/msg:text-orange-400 transition-colors" />
                              <span className="text-xs sm:text-sm font-semibold text-zinc-400 group-hover/msg:text-orange-400 transition-colors hidden xs:inline">Message</span>
                            </button>
                          )}
                        </div>

                        {/* Caption - Redesigned - Compact on Mobile */}
                        {post.caption && (
                          <div className="px-3 pt-3 pb-2 sm:px-6 sm:pt-5 sm:pb-4">
                            <p className="text-zinc-100 text-xs sm:text-sm lg:text-base leading-relaxed">{post.caption}</p>
                          </div>
                        )}

                        {/* Course Card - Redesigned - Compact on Mobile */}
                        <div className="mx-3 mb-3 sm:mx-5 sm:mb-5">
                          <div 
                            className="group/course relative overflow-hidden bg-gradient-to-br from-zinc-800/50 via-zinc-800/30 to-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/80 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-orange-500/10"
                            onClick={() => handleCourseClick(post)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover/course:opacity-100 transition-opacity"></div>
                            <div className="relative p-3 sm:p-4 lg:p-5">
                              <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${getDifficultyColor(post.lesson.difficulty)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/course:scale-110 group-hover/course:rotate-3 transition-all duration-300`}>
                                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5 lg:space-y-3">
                                  <div>
                                    <h4 className="font-bold text-white text-sm sm:text-base mb-1 sm:mb-1.5 group-hover/course:text-orange-400 transition-colors line-clamp-2 leading-snug">
                                      {post.lesson.title}
                                    </h4>
                                    {post.lesson.description && (
                                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed hidden sm:block">{post.lesson.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                                    <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r ${getDifficultyColor(post.lesson.difficulty)} text-white font-semibold text-[10px] sm:text-xs shadow-md`}>
                                      {post.lesson.difficulty}
                                    </span>
                                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs text-zinc-400">
                                      <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-zinc-800/50 rounded-md">
                                        <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="font-medium">{post.lesson._count?.modules || 0}</span>
                                      </span>
                                      <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-zinc-800/50 rounded-md">
                                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="font-medium">{post.lesson.views}</span>
                                      </span>
                                      <span className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-zinc-800/50 rounded-md">
                                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="font-medium">{post.lesson.duration}m</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Engagement Stats - Redesigned - Compact on Mobile */}
                        <div className="px-3 pb-2 sm:px-6 sm:pb-3 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            {post._count?.likes && post._count.likes > 0 && (
                              <span className="flex items-center gap-1 sm:gap-1.5 text-zinc-400">
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                                <span className="font-medium">{post._count.likes}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-zinc-400">
                            <span className="font-medium hover:text-orange-400 cursor-pointer transition-colors">
                              {post._count?.comments || 0} <span className="hidden xs:inline">{(post._count?.comments || 0) === 1 ? 'comment' : 'comments'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions - Redesigned - Compact on Mobile */}
                        <div className="px-3 py-2 sm:px-6 sm:py-3 border-t border-zinc-800/50 flex items-center justify-between gap-2 sm:gap-3">
                          <div className="flex-1">
                            <ReactionPicker
                              onReact={(type) => handleReact(post.id, type)}
                              currentReaction={post.userReaction}
                            />
                          </div>
                          <button className="p-2 sm:p-2.5 hover:bg-zinc-800/50 rounded-lg sm:rounded-xl transition-all duration-300 group/share hover:shadow-lg">
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover/share:text-orange-400 group-hover/share:scale-110 transition-all duration-300" />
                          </button>
                        </div>

                        {/* Comments - Redesigned - Compact on Mobile */}
                        <div className="px-3 pb-3 sm:px-6 sm:pb-5 border-t border-zinc-800/50 pt-3 sm:pt-4">
                          <CommentSection 
                            postId={post.id}
                            initialCount={post._count?.comments || 0}
                            onUserClick={(userId) => setViewingUserId(userId)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-2xl"></div>
                        <div className="relative p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50 rounded-full">
                          {searchQuery ? (
                            <Search className="w-16 h-16 text-zinc-500" />
                          ) : (
                            <Users className="w-16 h-16 text-zinc-500" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-extrabold text-white">
                          {searchQuery ? 'No posts found' : 'No posts yet'}
                        </h3>
                        <p className="text-zinc-400 text-base max-w-md">
                          {searchQuery ? 'Try a different search term or browse all posts' : 'Be the first to share your learning journey with the community!'}
                        </p>
                      </div>
                      {!searchQuery && session && (
                        <button
                          onClick={() => setShowCreatePost(true)}
                          className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 rounded-xl font-bold text-white shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Share Your First Course</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Active Members - Redesigned - Hidden on Mobile */}
              <div className="hidden lg:block lg:col-span-3 space-y-5">
                {/* Recent Chats (Only people user has chatted with) */}
                {conversationContacts.length > 0 && (
                  <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6">
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-orange-500" />
                        <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Recent Chats</h3>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium">{conversationContacts.length} {conversationContacts.length === 1 ? 'conversation' : 'conversations'}</p>
                    </div>
                    <div className="space-y-3">
                      {conversationContacts.slice(0, 5).map((user, idx) => (
                        <div
                          key={user.id || idx}
                          className="group/member flex items-center gap-3 p-3 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700/80 rounded-xl transition-all duration-300"
                        >
                          <button
                            onClick={() => setViewingUserId(user.id)}
                            className="relative flex-shrink-0"
                            title="View profile"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30 group-hover/member:scale-110 group-hover/member:shadow-xl group-hover/member:shadow-orange-500/50 transition-all duration-300">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-500 border-2 border-zinc-900 rounded-full animate-pulse"></div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => setViewingUserId(user.id)}
                              className="text-sm font-bold text-white group-hover/member:text-orange-400 transition-colors truncate block text-left w-full"
                            >
                              {user.name || 'Anonymous'}
                            </button>
                            <p className="text-xs text-zinc-500 font-medium">Continue chat</p>
                          </div>
                          <button
                            onClick={() => setMessengerRecipient({ id: user.id, name: user.name || 'User' })}
                            className="flex-shrink-0 p-2 bg-zinc-800/50 hover:bg-orange-500/20 border border-zinc-700/50 hover:border-orange-500/50 rounded-lg opacity-0 group-hover/member:opacity-100 transition-all duration-300"
                            title="Send message"
                          >
                            <MessageCircle className="w-4 h-4 text-zinc-400 group-hover/member:text-orange-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Courses */}
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Trending Now</h3>
                  </div>
                  <div className="space-y-3">
                    {trendingPosts.length > 0 ? (
                      trendingPosts.map((post, idx) => (
                        <button
                          key={post.id}
                          onClick={() => router.push(`/course/${post.lessonId}`)}
                          className="w-full text-left group/trending"
                        >
                          <div className="p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-orange-500/30 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                idx === 0 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                                idx === 1 ? 'bg-gradient-to-br from-zinc-400 to-zinc-500 text-white' :
                                idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                                'bg-gradient-to-br from-zinc-600 to-zinc-700 text-white'
                              } shadow-lg`}>
                                #{idx + 1}
                              </div>
                              <p className="flex-1 text-sm font-bold text-white group-hover/trending:text-orange-400 transition-colors line-clamp-2 leading-snug">
                                {post.lesson.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 ml-11">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span className="font-medium">{post.lesson.views}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-orange-500" />
                                <span className="font-medium">{post._count?.likes || 0}</span>
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-zinc-500 text-sm py-4">No trending posts yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && session && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-zinc-900 border-b-2 border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Share a Course</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white">{session.user?.name}</h3>
                  <p className="text-sm text-zinc-500">{session.user?.email}</p>
                </div>
              </div>

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What did you learn? Share your thoughts..."
                className="w-full bg-zinc-800/50 border-2 border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                rows={4}
              />

              {/* Select Course */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Select a course to share</h4>
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : myCourses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {myCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course.id)}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          selectedCourse === course.id
                            ? 'bg-orange-500/10 border-orange-500'
                            : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <h5 className="font-bold text-white mb-1">{course.title}</h5>
                        <p className="text-sm text-zinc-400 line-clamp-1">{course.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className={`px-2 py-0.5 rounded bg-gradient-to-r ${getDifficultyColor(course.difficulty)} text-white font-medium`}>
                            {course.difficulty}
                          </span>
                          <span className="text-zinc-500">{course._count?.modules || 0} modules</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 py-8">
                    You don't have any courses yet.{' '}
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="text-orange-500 hover:underline font-semibold"
                    >
                      Create one now
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-zinc-900 border-t-2 border-zinc-800 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-6 py-2 rounded-lg border-2 border-zinc-700 hover:bg-zinc-800 text-white font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!selectedCourse || !caption.trim() || posting}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/50 transition-all"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      {messengerRecipient && (
        <MessengerModal
          recipientId={messengerRecipient.id}
          recipientName={messengerRecipient.name}
          onClose={() => setMessengerRecipient(null)}
        />
      )}

      {/* User Profile Modal */}
      {viewingUserId && (
        <UserProfileModal
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
          onStartChat={(userId, userName) => {
            setMessengerRecipient({ id: userId, name: userName })
            setViewingUserId(null)
          }}
        />
      )}

      {/* Save Course Modal */}
      {showSaveCourseModal && selectedCourseToSave && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-xl"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Lưu khóa học vào Dashboard?
              </h3>

              {/* Course Name */}
              <p className="text-sm text-zinc-400 text-center mb-4">
                <span className="text-orange-400 font-semibold block mb-2">"{selectedCourseToSave.title}"</span>
                Khóa học này sẽ được sao chép vào Dashboard của bạn và bạn có thể học ngay.
              </p>

              {/* Cost Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-orange-500/10 border border-orange-500/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">💳</span>
                  </div>
                  <span className="text-orange-400 font-bold text-lg">30 Credits</span>
                </div>
                <p className="text-xs text-zinc-400 text-center">
                  Chi phí lưu khóa học của người khác
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveCourseModal(false)
                    setSelectedCourseToSave(null)
                  }}
                  disabled={savingCourse}
                  className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCourse}
                  disabled={savingCourse}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingCourse ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    'Đồng ý'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
