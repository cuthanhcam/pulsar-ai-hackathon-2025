'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Search, Loader2, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import MessengerModal from './MessengerModal'

interface Conversation {
  id: string
  updatedAt: string
  unreadCount?: number
  participants?: {
    user?: {
      id?: string
      name?: string | null
      email?: string
    }
  }[]
  messages?: {
    content?: string
    createdAt?: string
    sender?: {
      id?: string
      name?: string | null
    }
  }[]
}

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  createdAt: string
  _count: {
    lessons: number
    posts: number
    postComments: number
  }
}

export default function MessengerInbox() {
  const { data: session } = useSession()
  const [showInbox, setShowInbox] = useState(false)
  const [activeTab, setActiveTab] = useState<'messages' | 'people'>('messages')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (showInbox && session) {
      if (activeTab === 'messages') {
        fetchConversations()
      }
    }
  }, [showInbox, session, activeTab])

  useEffect(() => {
    if (showInbox && session && activeTab === 'people' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        fetchUsers()
      }, 300)
      return () => clearTimeout(timer)
    } else if (activeTab === 'people' && !searchQuery.trim()) {
      setUsers([]) // Clear users when search is empty
    }
  }, [searchQuery, showInbox, session, activeTab])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/messenger/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherUser = (conv: Conversation) => {
    return conv.participants?.find(p => p?.user?.id !== session?.user?.id)?.user
  }

  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const handleTabChange = (tab: 'messages' | 'people') => {
    setActiveTab(tab)
    setSearchQuery('') // Reset search when switching tabs
  }

  // Deduplicate conversations by other user ID (2nd layer protection)
  const uniqueConversations = conversations.reduce((acc, conv) => {
    if (!conv || !conv.participants) return acc
    const otherUser = getOtherUser(conv)
    if (!otherUser || !otherUser.id) return acc
    
    // Check if we already have a conversation with this user
    const existingIndex = acc.findIndex(c => {
      const existingOtherUser = getOtherUser(c)
      return existingOtherUser?.id === otherUser.id
    })
    
    if (existingIndex === -1) {
      // No existing conversation with this user, add it
      acc.push(conv)
    } else {
      // Already have conversation with this user, keep the most recent one
      const existing = acc[existingIndex]
      if (new Date(conv.updatedAt) > new Date(existing.updatedAt)) {
        acc[existingIndex] = conv
      }
    }
    
    return acc
  }, [] as Conversation[])

  const filteredConversations = uniqueConversations.filter(conv => {
    const otherUser = getOtherUser(conv)
    if (!otherUser) return false
    return !searchQuery || otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (!session) return null

  return (
    <>
      {/* Inbox Trigger Button - Facebook Style */}
      <div className="relative group">
        <button
          onClick={() => setShowInbox(!showInbox)}
          className="relative p-2 hover:bg-zinc-800 rounded-full transition-colors"
          title="Messenger"
        >
          <MessageCircle className="w-5 h-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
          
          {/* "Find People" Badge */}
          <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-blue-500 text-white text-[8px] font-bold rounded-full border-2 border-zinc-900">
            👥
          </span>
          
          {getUnreadCount() > 0 && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-900">
              {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
            </span>
          )}
        </button>
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50
          opacity-0 group-hover:opacity-100 transition-opacity">
          💬 Messenger
        </div>

        {/* Inbox Dropdown */}
        {showInbox && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowInbox(false)}
            />
            
            {/* Inbox Panel - Facebook Style */}
            <div className="absolute top-full right-0 mt-2 w-[360px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[9999] max-h-[600px] overflow-hidden"
              style={{
                boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
              }}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xl flex items-center gap-2">
                    Chats
                  </h3>
                  <button
                    onClick={() => setShowInbox(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>

                {/* Tabs - Facebook Style */}
                <div className="flex gap-1 mb-3 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
                  <button
                    onClick={() => handleTabChange('messages')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'messages'
                        ? 'bg-white dark:bg-zinc-700 text-blue-500 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Inbox
                  </button>
                  <button
                    onClick={() => handleTabChange('people')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'people'
                        ? 'bg-white dark:bg-zinc-700 text-blue-500 shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    People
                  </button>
                </div>

                {/* Search - Facebook Style */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeTab === 'messages' ? 'Search Messenger' : 'Search people'}
                    className="w-full pl-10 pr-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  {activeTab === 'people' && !searchQuery.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-500 font-semibold pointer-events-none">
                      Type to search
                    </div>
                  )}
                </div>

                {/* Facebook Messenger Button */}
                <a
                  href="https://m.me/756498440889581"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Liên hệ qua Messenger</span>
                </a>
              </div>

              {/* Content - Facebook Style */}
              <div className="max-h-[500px] overflow-y-auto bg-white dark:bg-zinc-950/30">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : activeTab === 'messages' ? (
                  filteredConversations.length > 0 ? (
                  <div>
                    {filteredConversations.map((conv) => {
                      const otherUser = getOtherUser(conv)
                      const lastMessage = conv.messages?.[0]
                      
                      if (!otherUser) return null
                      
                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setActiveChat({ id: otherUser.id, name: otherUser.name || 'User' })
                            setShowInbox(false)
                          }}
                          className="w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left group"
                        >
                          <div className="flex gap-3 items-center">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                                    {otherUser?.name || 'Anonymous'}
                                  </h4>
                                  {/* Unread Badge */}
                                  {conv.unreadCount && conv.unreadCount > 0 && (
                                    <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                                {lastMessage && (
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-600 ml-2 flex-shrink-0">
                                    {timeAgo(lastMessage.createdAt || '')}
                                  </span>
                                )}
                              </div>
                              {lastMessage ? (
                                <p className={`text-xs truncate ${
                                  conv.unreadCount && conv.unreadCount > 0 
                                    ? 'text-zinc-900 dark:text-white font-semibold' 
                                    : 'text-zinc-600 dark:text-zinc-400'
                                }`}>
                                  {lastMessage.sender?.id === session?.user?.id ? 'You: ' : ''}
                                  {lastMessage.content}
                                </p>
                              ) : (
                                <p className="text-xs text-zinc-400 dark:text-zinc-600">No messages yet</p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                        <MessageCircle className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-zinc-900 dark:text-zinc-300 text-sm font-medium mb-1">
                        {searchQuery ? 'No conversations found' : 'No messages yet'}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-600 text-xs">
                        {searchQuery ? 'Try a different search term' : 'Message someone to start a conversation'}
                      </p>
                    </div>
                  )
                ) : (
                  /* Find People Tab - Facebook Style */
                  users.length > 0 ? (
                    <div>
                      {users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setActiveChat({ id: user.id, name: user.name || 'User' })
                            setShowInbox(false)
                          }}
                          className="w-full px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors text-left group"
                        >
                          <div className="flex gap-3 items-center">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate mb-0.5">
                                {user.name || 'Anonymous'}
                              </h4>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mb-1">
                                {user.phone || user.email}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-600">
                                <span>{user._count.lessons} courses</span>
                                <span>•</span>
                                <span>{user._count.posts} posts</span>
                                <span>•</span>
                                <span>{user._count.postComments} comments</span>
                              </div>
                            </div>

                            {/* Message Icon */}
                            <div className="flex-shrink-0">
                              <div className="w-9 h-9 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-zinc-900 dark:text-zinc-300 text-sm font-medium mb-1">
                        {searchQuery.trim() ? 'No users found' : 'Find people'}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-600 text-xs">
                        {searchQuery.trim() ? 'Try a different search term' : 'Search by name, email, or phone'}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Active Chat Modal */}
      {activeChat && (
        <MessengerModal
          recipientId={activeChat.id}
          recipientName={activeChat.name}
          onClose={() => {
            setActiveChat(null)
            // Refresh conversations to update unread counts
            fetchConversations()
          }}
        />
      )}
    </>
  )
}

