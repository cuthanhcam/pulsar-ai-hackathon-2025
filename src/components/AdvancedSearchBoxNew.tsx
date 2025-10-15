'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, Loader2, Settings2 } from 'lucide-react'
import CoursePreferencesModal from './CoursePreferencesModal'
import APIKeyErrorModal from './APIKeyErrorModal'
import { Course } from '@/types/course'

interface CoursePreferences {
  learningPreference: string
  learningTime: string
  skillLevel: string
  topicsOfInterest: string[]
  instructionalMethod: string
}

interface AdvancedSearchBoxProps {
  onCourseGenerated?: (course: Course) => void
  onGenerationStart?: () => void
  externalSearchTerm?: string
  onSearchTermChange?: (term: string) => void
}

export default function AdvancedSearchBoxNew({ onCourseGenerated, onGenerationStart, externalSearchTerm, onSearchTermChange }: AdvancedSearchBoxProps) {
  const sessionData = useSession()
  const session = sessionData?.data
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showAPIKeyErrorModal, setShowAPIKeyErrorModal] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState('')

  // Sync external search term
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm)
    }
  }, [externalSearchTerm])

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value)
    onSearchTermChange?.(value)
  }

  const handleGenerateClick = () => {
    if (!searchTerm.trim()) {
      setError('Please enter a topic')
      return
    }

    if (!session) {
      router.push('/login')
      return
    }

    setShowPreferencesModal(true)
  }

  const handlePreferencesComplete = async (preferences: CoursePreferences) => {
    setShowPreferencesModal(false)
    setLoading(true)
    setError('')
    
    onGenerationStart?.()

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: searchTerm,
          difficulty: preferences.skillLevel || 'beginner',
          duration: 30,
          preferences: preferences
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Extract detailed error message
        let errorMsg = data.error || data.details || 'Failed to generate course'
        
        // Handle specific error cases
        if (response.status === 403 && errorMsg.includes('credits')) {
          // Credits error - show as regular error
          throw new Error(errorMsg)
        } else if (response.status === 400 && errorMsg.includes('API Key')) {
          // API Key error - will trigger API key modal
          throw new Error(errorMsg)
        } else if (response.status === 500) {
          // Server error - show generic message
          errorMsg = 'Server error while generating course. Please try again.'
          if (data.details) {
            console.error('Server error details:', data.details)
          }
          throw new Error(errorMsg)
        }
        
        console.error('API Error:', errorMsg, data)
        throw new Error(errorMsg)
      }

      if (data.creditsUsed) {
        console.log(`Course generated! Used ${data.creditsUsed} credits. Remaining: ${data.remainingCredits}`)
      }

      // Transform sections to lessons for frontend compatibility
      const transformedModules = (data.lesson.modules || []).map((module: any) => ({
        ...module,
        lessons: (module.sections || []).map((section: any) => ({
          id: section.id,
          title: section.title,
          content: section.content,
          duration: section.duration?.toString() || '10',
          completed: section.completed || false,
          order: section.order
        }))
      }))

      const course: Course = {
        id: data.lesson.id,
        title: data.lesson.title,
        description: data.lesson.description || `Learn ${searchTerm} from scratch`,
        modules: transformedModules,
        totalLessons: transformedModules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0),
        completedLessons: 0,
        createdAt: new Date().toISOString()
      }

      console.log('[AdvancedSearchBox] Transformed course:', {
        title: course.title,
        modulesCount: course.modules.length,
        lessonsPerModule: course.modules.map(m => m.lessons?.length || 0),
        totalLessons: course.totalLessons
      })

      if (onCourseGenerated) {
        onCourseGenerated(course)
      } else {
        router.push(`/course/${data.lesson.id}`)
      }
    } catch (err) {
      console.error('Error generating course:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate course'
      
      // Show API key modal for most errors (might be API key issue)
      // Only show regular error for credits issue
      if (errorMessage.toLowerCase().includes('insufficient credits') || 
          errorMessage.toLowerCase().includes('not enough credits')) {
        setError(errorMessage)
      } else {
        // For all other errors, show API key modal so user can try with new key
        setApiErrorMessage(errorMessage)
        setShowAPIKeyErrorModal(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAPIKeyUpdated = () => {
    setError('')
    setApiErrorMessage('')
    if (searchTerm.trim()) {
      setShowPreferencesModal(true)
    }
  }

  return (
    <div className="relative w-full">
      {error && (
        <div className="absolute -top-16 left-0 right-0 bg-red-500/95 backdrop-blur-sm text-white text-sm px-6 py-3 border-l-4 border-red-700 shadow-2xl rounded-xl z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 h-6 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              <span className="flex-1">{error}</span>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-white/80 hover:text-white p-1 transition-colors rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Factory.ai Search Container */}
      <div className="relative group">
        {/* Glowing border effect - Orange */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 opacity-20 group-hover:opacity-40 blur transition duration-300 rounded-2xl"></div>
        
        <div className="relative bg-zinc-900 border-2 border-zinc-800 group-hover:border-orange-500/50 transition-all duration-300 rounded-2xl overflow-hidden">
          {/* Search Input Area */}
          <div className="flex items-stretch">
            <div className="flex-1 px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-5 h-5 text-orange-500" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Learning Topic</span>
              </div>
              <input
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                className="w-full bg-transparent border-none text-white text-lg font-medium focus:outline-none placeholder:text-zinc-600"
                placeholder="What do you want to master today?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleGenerateClick()
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center border-l-2 border-zinc-800">
              <button
                onClick={handleGenerateClick}
                disabled={loading}
                className="h-full px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 group/btn shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">Generating...</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span className="text-sm">Generate</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20 text-white text-[11px] font-bold rounded">
                      <span>30</span>
                      <span className="text-[9px]">CREDITS</span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Options Bar */}
          <div className="border-t-2 border-zinc-800 px-6 py-3 bg-zinc-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Advanced options in next step</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono rounded">Enter</kbd>
              <span>to continue</span>
            </div>
          </div>
        </div>
      </div>

      <CoursePreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onComplete={handlePreferencesComplete}
        topic={searchTerm}
      />

      <APIKeyErrorModal
        isOpen={showAPIKeyErrorModal}
        onClose={() => setShowAPIKeyErrorModal(false)}
        onSuccess={handleAPIKeyUpdated}
        errorMessage={apiErrorMessage}
      />
    </div>
  )
}
