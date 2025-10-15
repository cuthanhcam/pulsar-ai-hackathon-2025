'use client'

import { Sparkles, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Top Announcement Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-2.5 px-4 text-center text-sm text-white font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
        <div className="relative z-10 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>AI-Powered Insights • Real-World Case Studies • GenAI for Business</span>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 sticky top-0 z-50 shadow-2xl shadow-purple-900/30 border-b border-purple-500/20 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-18 py-3">
            {/* Logo and Nav Links */}
            <div className="flex items-center space-x-10">
              <a href="/" className="group flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                  PulsarTeam
                </span>
              </a>
              
              <div className="hidden lg:flex items-center space-x-1">
                <a href="#" className="group px-4 py-2 text-gray-200 hover:text-white transition-all rounded-lg hover:bg-purple-800/30 relative">
                  <span>GenAI Category</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 transition-all" />
                </a>
                <a href="#" className="group px-4 py-2 text-gray-200 hover:text-white transition-all rounded-lg hover:bg-purple-800/30 relative">
                  <span>AI Tutor</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 transition-all" />
                </a>
                <a href="/tools" className="group px-4 py-2 text-gray-200 hover:text-white transition-all rounded-lg hover:bg-purple-800/30 relative">
                  <span>Toolbox AI</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-3/4 transition-all" />
                </a>
                <button className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-all rounded-lg hover:bg-gray-800/50">
                  <span>More</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="hidden md:block px-5 py-2 text-gray-200 hover:text-white transition-all font-medium">
                Sign Up
              </button>
              <button className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/50 overflow-hidden">
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-800 mt-3 pt-3">
              <div className="flex flex-col space-y-2">
                <a href="#" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  GenAI Category
                </a>
                <a href="#" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  AI Tutor
                </a>
                <a href="#" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  Toolbox AI
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
