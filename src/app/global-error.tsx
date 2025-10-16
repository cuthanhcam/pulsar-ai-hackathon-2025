'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="bg-zinc-950 text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
              </div>
              <div className="relative inline-flex items-center justify-center w-32 h-32 bg-red-500/10 border-2 border-red-500/30 rounded-full">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
                <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Critical Error</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
                Something Went Wrong
              </h1>
              
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={reset}
                className="group px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 inline-flex items-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <a
                href="/"
                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-orange-500/50 text-white font-bold rounded-xl transition-all inline-flex items-center gap-3"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </a>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-left">
                <div className="text-xs font-mono text-red-400 mb-2">Error Details:</div>
                <div className="text-xs font-mono text-zinc-400 break-all">
                  {error.message}
                </div>
                {error.digest && (
                  <div className="text-xs font-mono text-zinc-500 mt-2">
                    Digest: {error.digest}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
