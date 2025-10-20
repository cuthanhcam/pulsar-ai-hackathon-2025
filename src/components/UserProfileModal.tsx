'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, BookOpen, Heart, MessageSquare, Mail, Phone, Calendar, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  _count: {
    lessons: number
    posts: number
    postComments: number
    postLikes: number
  }
  lessons: {
    id: string
    title: string
    topic: string
    difficulty: string
    views: number
  }[]
  posts: {
    id: string
    caption: string
    createdAt: string
  }[]
}

interface UserProfileModalProps {
  userId: string
  onClose: () => void
  onStartChat?: (userId: string, userName: string) => void
}

export default function UserProfileModal({ userId, onClose, onStartChat }: UserProfileModalProps) {
  const { data: session } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500 to-emerald-500'
      case 'intermediate': return 'from-yellow-500 to-orange-500'
      case 'advanced': return 'from-orange-500 to-red-500'
      case 'expert': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-zinc-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <div className="relative p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{user.name || 'Anonymous'}</h2>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {session?.user?.id !== userId && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (onStartChat) {
                        onStartChat(userId, user.name || 'User')
                        onClose()
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-white shadow-lg hover:shadow-orange-500/50 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 p-6 border-b border-zinc-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{user._count.lessons}</div>
                <div className="text-xs text-zinc-500">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{user._count.posts}</div>
                <div className="text-xs text-zinc-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{user._count.postComments}</div>
                <div className="text-xs text-zinc-500">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{user._count.postLikes}</div>
                <div className="text-xs text-zinc-500">Reactions</div>
              </div>
            </div>

            {/* Recent Courses */}
            {user.lessons.length > 0 && (
              <div className="p-6 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  Recent Courses
                </h3>
                <div className="space-y-3">
                  {user.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getDifficultyColor(lesson.difficulty)} flex items-center justify-center flex-shrink-0`}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm mb-1 truncate">{lesson.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className={`px-2 py-0.5 rounded bg-gradient-to-r ${getDifficultyColor(lesson.difficulty)} bg-opacity-20 text-white`}>
                              {lesson.difficulty}
                            </span>
                            <span>{lesson.topic}</span>
                            <span>{lesson.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            {user.posts.length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Recent Posts
                </h3>
                <div className="space-y-3">
                  {user.posts.map((post) => (
                    <div key={post.id} className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-300 mb-2 line-clamp-2">{post.caption}</p>
                      <p className="text-xs text-zinc-500">{formatDate(post.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {user.lessons.length === 0 && user.posts.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-zinc-500 text-sm">No activity yet</p>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-zinc-500">User not found</p>
          </div>
        )}
      </div>
    </div>
  )
}

