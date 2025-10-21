'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react'

// Dynamic import for heavy canvas component
const NetworkCanvas = dynamic(() => import('@/components/NetworkCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Network Canvas Background */}
      <div className="absolute inset-0">
        <NetworkCanvas />
      </div>
      
      {/* Dark Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/90"></div>
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-zinc-950/30 to-zinc-950/70"></div>
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Welcome */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">PulsarTeam</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Welcome Back
                <br />
                to PulsarTeam
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Continue your learning journey and master new skills with our AI-powered platform.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Resume Learning</h3>
                  <p className="text-sm text-zinc-400">Pick up right where you left off</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Track Progress</h3>
                  <p className="text-sm text-zinc-400">See your achievements and milestones</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Access Anywhere</h3>
                  <p className="text-sm text-zinc-400">Learn on any device, anytime</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-zinc-500 text-sm">
            © 2025 PulsarTeam. All rights reserved.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-zinc-900/50 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6 lg:hidden">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black text-white">PulsarTeam</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-zinc-400">Sign in to continue learning</p>
          </div>

          {error && (
                <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl">
                  <p className="text-sm text-red-400 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-zinc-500 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              {/* OAuth Sign-In Buttons */}
              <div className="space-y-3">
                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border-2 border-zinc-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {/* GitHub Sign-In Button */}
                <button
                  type="button"
                  onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border-2 border-zinc-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              <div className="mt-8 text-center border-t-2 border-zinc-800 pt-6">
                <p className="text-zinc-400 text-sm">
              Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors inline-flex items-center gap-1">
                  <span>←</span>
                  <span>Back to home</span>
            </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
