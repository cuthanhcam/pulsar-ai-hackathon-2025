'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { createPortal } from 'react-dom'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/' })
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' })
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999]">
      {/* Backdrop - Factory Dark */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centering wrapper */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          {/* Modal - Factory.ai Style */}
          <div 
            role="dialog"
            className="relative w-full max-w-md bg-zinc-900 border-2 border-zinc-800 shadow-2xl rounded-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header - Factory Dark */}
        <div className="bg-zinc-950 px-6 py-5 border-b-2 border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-8 bg-orange-500"></div>
              <div className="w-1.5 h-8 bg-white/60"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Lưu trữ và truy cập khóa học của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 border-2 border-zinc-800 hover:border-orange-500/50 transition-all rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body - Factory Dark */}
        <div className="flex flex-col gap-3 p-6 bg-zinc-900">
          {/* GitHub Login */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-800 border-2 border-zinc-700 text-white hover:border-orange-500/50 transition-all font-bold rounded-xl hover:bg-zinc-700"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </button>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-zinc-700 text-zinc-900 hover:border-orange-500/50 transition-all font-bold rounded-xl hover:bg-gray-50"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Google
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">Hoặc</span>
            </div>
          </div>

          {/* Email Login Link */}
          <Link href="/login" onClick={onClose} className="w-full">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-orange-500 border-2 border-orange-400/50 text-white hover:bg-orange-600 hover:border-orange-400 transition-all font-bold rounded-xl shadow-lg shadow-orange-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              Email
            </button>
          </Link>

          {/* Register Link */}
          <div className="text-center pt-2 border-t-2 border-zinc-800">
            <p className="text-sm text-zinc-400">
              Chưa có tài khoản?{' '}
              <Link href="/register" onClick={onClose} className="font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

