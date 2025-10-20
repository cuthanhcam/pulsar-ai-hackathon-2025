'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { 
  Shield, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Coins,
  BookOpen,
  Trophy
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Quiz Results', href: '/admin/quizzes', icon: <Trophy className="w-5 h-5" /> },
  { label: 'Credits', href: '/admin/credits', icon: <Coins className="w-5 h-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not admin (client-side check)
  useEffect(() => {
    if (status === 'loading') return
    
    if (pathname !== '/admin/login' && status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, pathname, router])

  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show loading state during authentication check
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-zinc-900 border-r border-zinc-800 z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-zinc-500">PulsarTeam</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                      ${isActive 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-zinc-800">
            <div className="mb-3 px-4 py-3 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Signed in as</p>
              <p className="text-sm text-white font-medium truncate">{session?.user?.email}</p>
              <p className="text-xs text-orange-400 font-semibold mt-1">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Page Title */}
          <h2 className="text-xl font-bold text-white hidden lg:block">
            {navItems.find(item => item.href === pathname)?.label || 'Admin Panel'}
          </h2>

          {/* Spacer for mobile */}
          <div className="lg:hidden"></div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View Site →
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

