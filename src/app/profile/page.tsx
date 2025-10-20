'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, Clock, Trash2, Loader2, User, Calendar, Heart, MessageCircle, TrendingUp, LayoutGrid, Mail, Edit3, Share2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import HeaderNew from '@/components/HeaderNew'
import ReactionPicker, { ReactionType } from '@/components/ReactionPicker'
import CommentSection from '@/components/CommentSection'

const TechCanvas = dynamic(() => import('@/components/TechCanvas'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-zinc-950" />
})

interface Post {
  id: string
  caption: string
  createdAt: string
  userId: string
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
    }
  }
  _count?: {
    likes?: number
    comments?: number
  }
  userReaction?: ReactionType | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCanvas, setShowCanvas] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts')

  useEffect(() => {
    const timer = setTimeout(() => setShowCanvas(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchMyPosts()
    }
  }, [status, router])

  const fetchMyPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/community/posts?myPosts=true')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return

    setDeletingPostId(postId)
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId))
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleReact = async (postId: string, reactionType: ReactionType) => {
    try {
      await fetch(`/api/community/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      })
      fetchMyPosts()
    } catch (error) {
      console.error('Error reacting:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-orange-400 to-orange-500'
      case 'intermediate': return 'from-orange-500 to-orange-600'
      case 'advanced': return 'from-orange-600 to-orange-700'
      case 'expert': return 'from-orange-700 to-orange-800'
      default: return 'from-zinc-500 to-zinc-600'
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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
          {/* Cover Photo */}
          <div className="relative h-[320px] bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-zinc-900 border-b border-zinc-800/50 overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>

          {/* Profile Info */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Avatar & Name - Overlapping Cover */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-20 sm:-mt-24 mb-4">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-5xl sm:text-6xl shadow-2xl border-6 border-zinc-950/90 backdrop-blur-xl group-hover:scale-105 transition-all duration-300">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/40 to-orange-600/40 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                </div>

                {/* Name & Info */}
                <div className="flex-1 text-center sm:text-left mb-2 sm:mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1">
                    <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                      {session.user?.name || 'User'}
                    </span>
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 text-zinc-400 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-xs sm:text-sm">{session.user?.email}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-white font-semibold text-xs sm:text-sm">{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-2 sm:mb-4">
                  <button 
                    onClick={() => router.push('/settings')}
                    className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold text-white text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-3 sm:p-4 hover:border-zinc-700 transition-all">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">{posts.length}</p>
                    <p className="text-xs text-zinc-400 font-medium">Posts</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-3 sm:p-4 hover:border-zinc-700 transition-all">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg">
                      <Heart className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">
                      {posts.reduce((sum, p) => sum + (p._count?.likes || 0), 0)}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium">Likes</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-3 sm:p-4 hover:border-zinc-700 transition-all">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-orange-400" />
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-white">
                      {posts.reduce((sum, p) => sum + (p._count?.comments || 0), 0)}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium">Comments</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-zinc-800/50 mb-4">
                <div className="flex gap-0">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-5 py-2.5 font-semibold text-sm transition-all relative ${
                      activeTab === 'posts'
                        ? 'text-orange-400'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Posts</span>
                    </div>
                    {activeTab === 'posts' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`px-5 py-2.5 font-semibold text-sm transition-all relative ${
                      activeTab === 'about'
                        ? 'text-orange-400'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>About</span>
                    </div>
                    {activeTab === 'about' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="pb-8">
                {activeTab === 'posts' ? (
                  // Posts Timeline
                  loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="max-w-2xl mx-auto space-y-3">
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden transition-all duration-300"
                        >
                          {/* Post Header */}
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-orange-500/30">
                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-sm">{session.user?.name || 'User'}</h3>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                  {timeAgo(post.createdAt)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPostId === post.id}
                              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all group/delete disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete post"
                            >
                              {deletingPostId === post.id ? (
                                <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-zinc-400 group-hover/delete:text-red-400 transition-colors" />
                              )}
                            </button>
                          </div>

                          {/* Caption */}
                          {post.caption && (
                            <div className="px-4 pb-3">
                              <p className="text-zinc-100 text-sm leading-relaxed">{post.caption}</p>
                            </div>
                          )}

                          {/* Course Card */}
                          <div className="mx-4 mb-4">
                            <button
                              onClick={() => router.push(`/lessons/${post.lesson.id}`)}
                              className="w-full text-left group/course"
                            >
                              <div className="relative overflow-hidden bg-gradient-to-br from-zinc-800/50 via-zinc-800/30 to-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/80 rounded-lg transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover/course:opacity-100 transition-opacity"></div>
                                <div className="relative p-3">
                                  <div className="flex items-start gap-2.5">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getDifficultyColor(post.lesson.difficulty)} flex items-center justify-center flex-shrink-0 shadow-lg group-hover/course:scale-110 group-hover/course:rotate-3 transition-all duration-300`}>
                                      <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <h4 className="font-bold text-white text-sm group-hover/course:text-orange-400 transition-colors line-clamp-2 leading-snug">
                                        {post.lesson.title}
                                      </h4>
                                      {post.lesson.description && (
                                        <p className="text-xs text-zinc-400 line-clamp-1">{post.lesson.description}</p>
                                      )}
                                      <div className="flex items-center flex-wrap gap-2">
                                        <span className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${getDifficultyColor(post.lesson.difficulty)} text-white font-semibold text-xs`}>
                                          {post.lesson.difficulty}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                          <span className="flex items-center gap-0.5">
                                            <BookOpen className="w-3 h-3" />
                                            {post.lesson._count?.modules || 0}
                                          </span>
                                          <span className="flex items-center gap-0.5">
                                            <Eye className="w-3 h-3" />
                                            {post.lesson.views}
                                          </span>
                                          <span className="flex items-center gap-0.5">
                                            <Clock className="w-3 h-3" />
                                            {post.lesson.duration}m
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Engagement Stats */}
                          <div className="px-4 pb-2 flex items-center justify-between text-xs border-b border-zinc-800/50">
                            <div className="flex items-center gap-2">
                              {post._count?.likes && post._count.likes > 0 && (
                                <div className="flex items-center gap-1 text-zinc-400">
                                  <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                  <span className="font-medium">{post._count.likes}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-zinc-400 font-medium">
                              {post._count?.comments || 0} {post._count?.comments === 1 ? 'comment' : 'comments'}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="px-4 py-2 border-b border-zinc-800/50 flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <ReactionPicker
                                onReact={(type) => handleReact(post.id, type)}
                                currentReaction={post.userReaction}
                              />
                            </div>
                            <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all group/share">
                              <Share2 className="w-4 h-4 text-zinc-400 group-hover/share:text-orange-400 group-hover/share:scale-110 transition-all" />
                            </button>
                          </div>

                          {/* Comments Section */}
                          <div className="px-4 pb-4 pt-3">
                            <CommentSection
                              postId={post.id}
                              initialCount={post._count?.comments || 0}
                              onUserClick={(userId) => {}}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-2xl mx-auto text-center py-16 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-xl shadow-2xl">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full blur-xl"></div>
                          <div className="relative p-5 bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 border border-zinc-700/50 rounded-full">
                            <LayoutGrid className="w-12 h-12 text-zinc-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-extrabold text-white">No posts yet</h3>
                          <p className="text-zinc-400 text-sm max-w-md">
                            Share your learning journey with the community!
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/community')}
                          className="group relative px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 rounded-lg font-semibold text-white text-sm shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative">Create Your First Post</div>
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  // About Section
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 backdrop-blur-2xl border border-zinc-800/80 rounded-xl shadow-2xl p-5">
                      <h3 className="text-lg font-bold text-white mb-4">About</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <Mail className="w-4 h-4 text-orange-400 mt-1" />
                          <div>
                            <p className="text-xs text-zinc-500 font-medium">Email</p>
                            <p className="text-white text-sm">{session.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Calendar className="w-4 h-4 text-orange-400 mt-1" />
                          <div>
                            <p className="text-xs text-zinc-500 font-medium">Joined</p>
                            <p className="text-white text-sm">Member since {new Date().getFullYear()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <TrendingUp className="w-4 h-4 text-orange-400 mt-1" />
                          <div>
                            <p className="text-xs text-zinc-500 font-medium">Activity</p>
                            <p className="text-white text-sm">{posts.length} posts shared</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
