'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'

// Lazy load canvas for better performance
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function NotFound() {
  const [showCanvas, setShowCanvas] = useState(false)

  // Defer canvas loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCanvas(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
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
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Number with Glow Effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
            </div>
            <h1 className="relative text-[180px] sm:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-orange-600 leading-none tracking-tighter">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-4">
              <Search className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">Page Not Found</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Oops! Lost in Space
            </h2>
            
            <p className="text-lg text-zinc-400 max-w-lg mx-auto">
              The page you're looking for has drifted away into the digital void. 
              Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/">
              <button className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 inline-flex items-center gap-3">
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500/50 text-white font-bold rounded-xl transition-all inline-flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: '/ai-tutor', label: 'AI Tutor', icon: '🤖' },
                { href: '/dashboard', label: 'Dashboard', icon: '📊' },
                { href: '/pricing', label: 'Pricing', icon: '💎' },
                { href: '/settings', label: 'Settings', icon: '⚙️' }
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="group p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-orange-500/50 rounded-xl transition-all cursor-pointer text-center">
                    <div className="text-2xl mb-2">{link.icon}</div>
                    <div className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                      {link.label}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Error Code */}
          <div className="mt-8 text-xs text-zinc-600 font-mono">
            ERROR CODE: 404 | NOT_FOUND | RESOURCE_UNAVAILABLE
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </div>
  )
}

