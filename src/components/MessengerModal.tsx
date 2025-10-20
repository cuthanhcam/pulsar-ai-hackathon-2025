'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import { X, Send, Loader2, MessageCircle, Minimize2, Maximize2, Check, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  sender: {
    id: string
    name: string | null
    email: string
  }
}

interface Conversation {
  id: string
  participants: {
    user: {
      id: string
      name: string | null
      email: string
    }
  }[]
  messages: Message[]
}

interface MessengerModalProps {
  recipientId: string
  recipientName: string
  onClose: () => void
}

export default function MessengerModal({ recipientId, recipientName, onClose }: MessengerModalProps) {
  const { data: session } = useSession()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadMessages = useCallback(async () => {
    if (!conversation) return

    try {
      const response = await fetch(`/api/messenger/conversations/${conversation.id}/messages`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages || [])
        // Mark messages as read
        await fetch(`/api/messenger/conversations/${conversation.id}/mark-read`, {
          method: 'POST'
        })
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [conversation])

  const initConversation = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/messenger/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId })
      })

      const data = await response.json()
      if (response.ok) {
        setConversation(data.conversation)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setLoading(false)
    }
  }, [recipientId])

  useEffect(() => {
    initConversation()
  }, [initConversation])

  // Mark all messages as read when conversation opens
  useEffect(() => {
    if (!conversation) return
    
    // Immediate mark-read on open
    fetch(`/api/messenger/conversations/${conversation.id}/mark-read`, {
      method: 'POST'
    }).catch(err => console.error('Error marking as read:', err))
  }, [conversation])

  // Optimized polling: Only poll when window is active, longer interval (5s)
  useEffect(() => {
    if (!conversation) return

    loadMessages()

    // Only poll if window is visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMessages()
      }
    }

    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMessages()
      }
    }, 5000) // Increased from 3s to 5s

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [conversation, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || sending) return

    setSending(true)
    const messageContent = newMessage
    setNewMessage('') // Optimistic UI update
    
    try {
      const response = await fetch(`/api/messenger/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent })
      })

      if (response.ok) {
        await loadMessages()
        // Extra mark-read call after sending to ensure unread count is correct
        await fetch(`/api/messenger/conversations/${conversation.id}/mark-read`, {
          method: 'POST'
        })
      } else {
        setNewMessage(messageContent) // Restore if failed
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent) // Restore if failed
    } finally {
      setSending(false)
    }
  }, [newMessage, conversation, sending, loadMessages])

  const timeAgo = useCallback((date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
    
    // Format date for older messages
    const messageDate = new Date(date)
    const now = new Date()
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }, [])

  const handleClose = useCallback(async () => {
    // Mark all messages as read before closing
    if (conversation) {
      try {
        await fetch(`/api/messenger/conversations/${conversation.id}/mark-read`, {
          method: 'POST'
        })
      } catch (err) {
        console.error('Error marking as read on close:', err)
      }
    }
    onClose()
  }, [conversation, onClose])

  if (!mounted) return null

  const modalContent = (
    <div 
      className="fixed z-[10000]"
      style={{
        bottom: '16px',
        right: '16px',
        position: 'fixed'
      }}
    >
      {/* Chat Window - Facebook Style */}
      <div className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
        minimized ? 'w-80 h-16' : 'w-[360px] h-[540px]'
      }`}
      style={{
        boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header - Facebook Messenger Style */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {recipientName.charAt(0).toUpperCase()}
              </div>
              {/* Active status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight">
                {recipientName}
              </h3>
              <p className="text-[11px] text-green-500 font-medium">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title={minimized ? "Expand" : "Minimize"}
            >
              {minimized ? (
                <Maximize2 className="w-4 h-4 text-blue-500" />
              ) : (
                <Minimize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages - Facebook Messenger Style */}
            <div className="h-[420px] overflow-y-auto px-3 py-4 bg-white dark:bg-zinc-950/50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender.id === session?.user?.id
                    const showAvatar = index === messages.length - 1 || 
                                      messages[index + 1]?.sender.id !== message.sender.id
                    const showTime = showAvatar || index === messages.length - 1
                    const isGrouped = index > 0 && messages[index - 1].sender.id === message.sender.id

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-1.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${
                          isGrouped ? 'mt-0.5' : 'mt-2'
                        }`}
                      >
                        {/* Avatar - only show on last message of group */}
                        <div className="w-6 h-6 flex-shrink-0">
                          {showAvatar && !isOwnMessage && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-[10px]">
                              {message.sender.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className={`px-3 py-2 shadow-sm ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-3xl rounded-br-md'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-3xl rounded-bl-md'
                          }`}>
                            <p className="text-[13px] leading-snug break-words">{message.content}</p>
                          </div>

                          {/* Timestamp & Read Receipt - only show on last message of group */}
                          {showTime && (
                            <div className="flex items-center gap-1 mt-0.5 px-2">
                              <span className={`text-[10px] text-zinc-400 dark:text-zinc-600`}>
                                {timeAgo(message.createdAt)}
                              </span>
                              {/* Read Receipt - only for sent messages */}
                              {isOwnMessage && (
                                <span className="flex items-center" title={message.isRead ? 'Đã xem' : 'Đã gửi'}>
                                  {message.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Check className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-1">
                    No messages yet
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-600 text-xs">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
            </div>

            {/* Input - Facebook Messenger Style */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 bg-white dark:bg-zinc-900">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Aa"
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 rounded-full bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all"
                  title="Send"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

