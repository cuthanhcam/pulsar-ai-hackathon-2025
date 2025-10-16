'use client'

import { Menu, Zap, LogOut, Sparkles, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoginModal from './LoginModal'

export default function HeaderNew() {
  const pathname = usePathname()
  const sessionData = useSession()
  const session = sessionData?.data
  const [credits, setCredits] = useState<number>(440)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  // Fetch credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/user/credits')
        const data = await response.json()
        
        if (response.ok && typeof data.credits === 'number') {
          setCredits(data.credits)
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err)
      }
    }

    if (sessionData.status === 'authenticated') {
      fetchCredits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData.status])

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
                      
                      <Link href="/settings">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Settings</span>
                        </button>
                      </Link>
                      
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
