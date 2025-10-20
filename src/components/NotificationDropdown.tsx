'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const previousUnreadCountRef = useRef(0)

  const fetchNotifications = useCallback(async (showLoader = true) => {
    if (!session) return
    
    if (showLoader) setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        const newNotifications = data.notifications || []
        
        // Check if there are new unread notifications
        const newUnreadCount = newNotifications.filter((n: Notification) => !n.isRead).length
        
        if (newUnreadCount > previousUnreadCountRef.current && !showLoader) {
          // New notification arrived! Trigger animation
          setHasNewNotification(true)
          setTimeout(() => setHasNewNotification(false), 2000)
        }
        
        previousUnreadCountRef.current = newUnreadCount
        setNotifications(newNotifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [session])

  const markAsRead = useCallback(async (notificationId?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications(false)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }, [fetchNotifications])

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchNotifications(true)
    }
  }, [session, fetchNotifications])

  // Real-time polling for notifications (every 10 seconds)
  useEffect(() => {
    if (!session) return

    // Only poll if window is visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications(false) // Background fetch without loader
      }
    }

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchNotifications(false) // Background fetch without loader
      }
    }, 10000) // Poll every 10 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session, fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reaction': return '❤️'
      case 'comment': return '💬'
      case 'message': return '💌'
      case 'follow': return '👤'
      default: return '🔔'
    }
  }

  if (!session) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Bell 
          className={`w-5 h-5 text-zinc-400 transition-all ${
            hasNewNotification ? 'animate-bounce text-orange-500' : ''
          }`} 
        />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all ${
            hasNewNotification ? 'animate-pulse scale-110' : ''
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-800">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead()}
                  className="text-xs text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-zinc-800/30' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id)
                      }
                      if (notification.link) {
                        window.location.href = notification.link
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-1">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500">
                            {timeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="w-12 h-12 text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

