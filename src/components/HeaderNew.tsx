'use client'

import { Menu, Zap, LogOut, Sparkles, X, Users, Bell, MessageCircle } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginModal from './LoginModal'
import NotificationDropdown from './NotificationDropdown'
import MessengerInbox from './MessengerInbox'

export default function HeaderNew() {
  const pathname = usePathname()
  const sessionData = useSession()
  const session = sessionData?.data
  const [credits, setCredits] = useState<number>(440)
  const [userRole, setUserRole] = useState<string>('user')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [messengerUnread, setMessengerUnread] = useState<number>(0)
  const [notificationsUnread, setNotificationsUnread] = useState<number>(0)
  const [showMobileMessenger, setShowMobileMessenger] = useState(false)
  const [showMobileNotifications, setShowMobileNotifications] = useState(false)
  
  // Auto-open messenger/notifications when toggled in mobile menu
  useEffect(() => {
    if (showMobileMessenger) {
      // Delay to ensure component is mounted
      const timer = setTimeout(() => {
        const messengerContainer = document.querySelector('.mobile-messenger-container')
        // Try multiple selectors
        let triggerBtn = messengerContainer?.querySelector('button[title="Messenger"]') as HTMLButtonElement
        if (!triggerBtn) {
          // Fallback: find first button in container
          triggerBtn = messengerContainer?.querySelector('button') as HTMLButtonElement
        }
        
        if (triggerBtn) {
          console.log('[Mobile Menu] Auto-triggering Messenger')
          triggerBtn.click()
        } else {
          console.warn('[Mobile Menu] Messenger trigger button not found')
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [showMobileMessenger])
  
  useEffect(() => {
    if (showMobileNotifications) {
      // Delay to ensure component is mounted
      const timer = setTimeout(() => {
        const notifContainer = document.querySelector('.mobile-notifications-container')
        // Try multiple selectors
        let triggerBtn = notifContainer?.querySelector('button[title="Notifications"]') as HTMLButtonElement
        if (!triggerBtn) {
          // Fallback: find first button in container
          triggerBtn = notifContainer?.querySelector('button') as HTMLButtonElement
        }
        
        if (triggerBtn) {
          console.log('[Mobile Menu] Auto-triggering Notifications')
          triggerBtn.click()
        } else {
          console.warn('[Mobile Menu] Notifications trigger button not found')
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [showMobileNotifications])

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/user/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: null })
      })
      
      localStorage.removeItem('hasSeenOnboarding')
      signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('hasSeenOnboarding')
      signOut({ callbackUrl: '/' })
    }
  }

  // Fetch credits and user role
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch credits
        const creditsResponse = await fetch('/api/user/credits')
        const creditsData = await creditsResponse.json()
        
        if (creditsResponse.ok && typeof creditsData.credits === 'number') {
          setCredits(creditsData.credits)
        }

        // Fetch user profile for role
        const profileResponse = await fetch('/api/user/profile')
        const profileData = await profileResponse.json()
        
        console.log('[Header] Profile data:', profileData)
        console.log('[Header] Session user email:', session?.user?.email)
        
        if (profileResponse.ok && profileData.user?.role) {
          console.log('[Header] Setting user role:', profileData.user.role)
          setUserRole(profileData.user.role)
        } else {
          console.log('[Header] Failed to get role from profile, using default')
        }
      } catch (err) {
        console.error('[Header] Failed to fetch user data:', err)
      }
    }

    if (sessionData.status === 'authenticated' && session?.user?.id) {
      fetchUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData.status, session?.user?.id])

  // Fetch unread counts for messenger and notifications
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch messenger unread count
        const messengerRes = await fetch('/api/messenger/conversations')
        if (messengerRes.ok) {
          const data = await messengerRes.json()
          // API returns { conversations: [...] }
          const conversations = data.conversations || data
          // Ensure conversations is an array before calling reduce
          if (Array.isArray(conversations)) {
            const totalUnread = conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0)
            setMessengerUnread(totalUnread)
          } else {
            console.warn('[Header] Messenger conversations is not an array:', conversations)
            setMessengerUnread(0)
          }
        }

        // Fetch notifications unread count
        const notifRes = await fetch('/api/notifications')
        if (notifRes.ok) {
          const data = await notifRes.json()
          // API returns { notifications: [...] }
          const notifications = data.notifications || data
          // Ensure notifications is an array before calling filter
          if (Array.isArray(notifications)) {
            const unreadCount = notifications.filter((n: any) => !n.isRead).length
            setNotificationsUnread(unreadCount)
          } else {
            console.warn('[Header] Notifications is not an array:', notifications)
            setNotificationsUnread(0)
          }
        }
      } catch (err) {
        console.error('[Header] Failed to fetch unread counts:', err)
        // Reset counts on error
        setMessengerUnread(0)
        setNotificationsUnread(0)
      }
    }

    if (sessionData.status === 'authenticated' && session?.user?.id) {
      fetchUnreadCounts()
      
      // Poll every 10 seconds for real-time updates (only when tab is active)
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchUnreadCounts()
        }
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [sessionData.status, session?.user?.id])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false)
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) => {
    const isActive = pathname === href
    
    return (
      <Link 
        href={href}
        className={`group relative px-4 py-2 text-sm font-bold transition-all rounded-lg ${
          isActive 
            ? 'text-white bg-zinc-800' 
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        }`}
      >
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-orange-500"></span>
        )}
      </Link>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex gap-1">
                <div className="w-1 h-8 bg-orange-500 group-hover:h-10 transition-all duration-300"></div>
                <div className="w-1 h-8 bg-white/60 group-hover:h-10 transition-all duration-300 delay-75"></div>
            </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-white">Pulsar</span>
                <span className="text-orange-500">Team</span>
            </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <NavLink href="/ai-tutor" icon={<Sparkles className="w-4 h-4" />}>
                AI Tutor
              </NavLink>
              <NavLink href="/dashboard">
                Dashboard
              </NavLink>
              {session && (
                <NavLink href="/community" icon={<Users className="w-4 h-4" />}>
                  Community
                </NavLink>
              )}
              <NavLink href="/pricing">
                Pricing
              </NavLink>
              
              {/* Credits Badge */}
            {session && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg ml-2">
                  <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="font-black text-white text-sm">{credits}</span>
              </div>
            )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
            {session ? (
              <>
                  {/* Mobile Credits */}
                  <div className="lg:hidden flex items-center gap-1.5 px-2 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                    <span className="font-black text-white text-xs">{credits}</span>
                  </div>

                  {/* Notifications - Desktop only */}
                  <div className="hidden lg:block">
                    <NotificationDropdown />
                  </div>

                  {/* Messenger - Desktop only */}
                  <div className="hidden lg:block">
                    <MessengerInbox />
                  </div>

                  {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-orange-500/50 transition-all rounded-lg"
                  >
                      <div className="h-7 w-7 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center rounded-lg">
                      <span className="text-white text-xs font-black">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                      <span className="text-sm text-white font-bold hidden sm:inline max-w-[100px] truncate">
                      {session.user.name || 'User'}
                    </span>
                  </button>

                    {/* Dropdown */}
                  {showUserMenu && (
                      <div className="absolute top-full right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl overflow-hidden z-50">
                        <div className="p-1">
                      <Link href="/dashboard">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                              <span>Dashboard</span>
                        </button>
                      </Link>
                      
                      <Link href="/profile">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                              <span>Profile</span>
                        </button>
                      </Link>
                      
                      <Link href="/settings">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </Link>
                      
                      {/* Debug info - only in development */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="px-4 py-2 text-xs text-zinc-500 border-t border-zinc-800">
                          Role: {userRole} | Email: {session?.user?.email?.substring(0, 15)}...
                        </div>
                      )}
                      
                      {/* Admin Link - Only for admins */}
                      {(userRole === 'admin' || session?.user?.email === 'test@gmail.com' || session?.user?.email === 'admin@gmail.com') && (
                        <Link href="/admin">
                          <button 
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-400 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-600/20 rounded-lg transition-all border border-transparent hover:border-orange-500/30"
                            onClick={() => console.log('[Header] Admin button clicked. Role:', userRole, 'Email:', session?.user?.email)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Admin Dashboard</span>
                          </button>
                        </Link>
                      )}
                      
                          <div className="h-px bg-zinc-800 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                        </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-all"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
          </button>
            </div>
        </nav>
      </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-zinc-800 bg-zinc-950">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-2">
              <Link 
                href="/ai-tutor"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                  pathname === '/ai-tutor' 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Tutor
              </Link>
              
              <Link 
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                  pathname === '/dashboard' 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                Dashboard
              </Link>

              {session && (
                <>
                  <Link 
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                      pathname === '/profile' 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  {/* Messenger & Notifications for Mobile Only */}
                  <div className="border-t border-zinc-800 pt-3 mt-2">
                    <p className="px-4 mb-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Messages & Alerts</p>
                    
                    <div className="px-4 space-y-2">
                      {/* Messenger Mobile Button with Text */}
                      <button
                        onClick={() => setShowMobileMessenger(!showMobileMessenger)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                          showMobileMessenger 
                            ? 'bg-zinc-800 text-white' 
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="flex-1 text-left">Messages</span>
                        {messengerUnread > 0 && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[24px] text-center">
                            {messengerUnread > 99 ? '99+' : messengerUnread}
                          </span>
                        )}
                      </button>
                      
                      {/* Messenger Inbox - Show when clicked */}
                      {showMobileMessenger && (
                        <div className="mobile-messenger-container bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800 max-h-[500px] overflow-y-auto">
                          <div className="[&>div>button]:!hidden [&>div>.fixed]:!hidden [&>div>div:last-child]:!static [&>div>div:last-child]:!w-full [&>div>div:last-child]:!mt-0 [&>div>div:last-child]:!shadow-none [&>div>div:last-child]:!border-0 [&>div>div:last-child]:!rounded-none [&>div>div:last-child]:!bg-transparent">
                            <MessengerInbox />
                          </div>
                        </div>
                      )}
                      
                      {/* Notifications Mobile Button with Text */}
                      <button
                        onClick={() => setShowMobileNotifications(!showMobileNotifications)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                          showMobileNotifications 
                            ? 'bg-zinc-800 text-white' 
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                        <span className="flex-1 text-left">Notifications</span>
                        {notificationsUnread > 0 && (
                          <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full min-w-[24px] text-center shadow-lg shadow-orange-500/50">
                            {notificationsUnread > 99 ? '99+' : notificationsUnread}
                          </span>
                        )}
                      </button>
                      
                      {/* Notifications Dropdown - Show when clicked */}
                      {showMobileNotifications && (
                        <div className="mobile-notifications-container bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800 max-h-[500px] overflow-y-auto">
                          <div className="[&>div>button]:!hidden [&>div>.fixed]:!hidden [&>div>div:last-child]:!static [&>div>div:last-child]:!w-full [&>div>div:last-child]:!mt-0 [&>div>div:last-child]:!shadow-none [&>div>div:last-child]:!border-0 [&>div>div:last-child]:!rounded-none [&>div>div:last-child]:!bg-transparent">
                            <NotificationDropdown />
                          </div>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  <Link 
                    href="/community"
                    onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                    pathname === '/community' 
                      ? 'bg-zinc-800 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Community
                </Link>
                </>
              )}
              
              <Link 
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                  pathname === '/pricing' 
                    ? 'bg-zinc-800 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                Pricing
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
