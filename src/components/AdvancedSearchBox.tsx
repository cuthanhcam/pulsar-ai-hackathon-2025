'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Command, Globe, Paperclip, Zap, Loader2 } from 'lucide-react'
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
}

export default function AdvancedSearchBox({ onCourseGenerated, onGenerationStart }: AdvancedSearchBoxProps) {
  const sessionData = useSession()
  const session = sessionData?.data
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('react')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showAPIKeyErrorModal, setShowAPIKeyErrorModal] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState('')

  const handleGenerateClick = () => {
    if (!searchTerm.trim()) {
      setError('Please enter a topic')
      return
    }

    if (!session) {
      router.push('/login')
      return
    }

    // Show preferences modal instead of generating directly
    setShowPreferencesModal(true)
  }

  const handlePreferencesComplete = async (preferences: CoursePreferences) => {
    setShowPreferencesModal(false)
    setLoading(true)
    setError('')
    
    // Notify parent that generation started
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
             throw new Error(data.error || 'Failed to generate course')
           }

           // Show success message with credits info
           if (data.creditsUsed) {
             console.log(`Course generated! Used ${data.creditsUsed} credits. Remaining: ${data.remainingCredits}`)
           }

           // Transform API response to Course format
           const course: Course = {
             id: data.lesson.id,
             title: data.lesson.title,
             description: data.lesson.description || `Learn ${searchTerm} from scratch`,
             modules: data.lesson.modules || [],
             totalLessons: data.lesson.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0,
             completedLessons: 0,
             createdAt: new Date().toISOString()
           }

           // Pass course data to parent if callback provided
           if (onCourseGenerated) {
             onCourseGenerated(course)
           } else {
             // Fallback: redirect to course page if no callback
             router.push(`/course/${data.lesson.id}`)
           }
    } catch (err) {
      console.error('Error generating course:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate course'
      
      // Check if error is related to API key or parsing
      if (errorMessage.includes('Failed to parse') || 
          errorMessage.includes('API key') || 
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorMessage.includes('Invalid') ||
          errorMessage.includes('generateContent')) {
        setApiErrorMessage(errorMessage)
        setShowAPIKeyErrorModal(true)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAPIKeyUpdated = () => {
    // Retry generation after API key update
    setError('')
    setApiErrorMessage('')
    if (searchTerm.trim()) {
      setShowPreferencesModal(true)
    }
  }

  return (
    <div className="relative backdrop-blur-xl bg-black/30 rounded-2xl border border-indigo-500/20 shadow-2xl">
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-red-500 text-white text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div className="p-4 relative">
        <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden border border-indigo-500/20">
          <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none opacity-50" style={{
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
            boxShadow: 'rgba(99, 102, 241, 0.3) 0px 0px 0px 1px inset'
          }}>
            <div className="absolute inset-0 rounded-md" style={{
              background: 'linear-gradient(155.16deg, transparent, rgba(152, 90, 245, 0.3), transparent)'
            }} />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 resize-none bg-transparent border-none text-white caret-white text-sm focus:outline-none min-h-[60px] rounded-md relative z-10"
            style={{ height: '60px', overflow: 'hidden' }}
            placeholder="Enter your learning topic..."
          />
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-2 sm:pt-3 border-t border-white/5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors relative group hover:bg-indigo-500/5">
            <Command className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors relative group hover:bg-indigo-500/5">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors relative group hover:bg-indigo-500/5">
            <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all flex items-center gap-1.5 sm:gap-2 relative overflow-hidden h-8 sm:h-9 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md border border-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />}
          <div className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                <span className="text-xs sm:text-[13px] font-medium">Generating...</span>
              </>
            ) : (
              <>
                <span className="text-xs sm:text-[13px] font-medium">Generate</span>
                <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/10 text-yellow-400">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 font-bold" style={{ color: 'rgb(255, 240, 0)' }} />
                  <span className="text-[11px] font-bold" style={{ color: 'rgb(255, 240, 0)' }}>30</span>
                </div>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Course Preferences Modal */}
      <CoursePreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onComplete={handlePreferencesComplete}
        topic={searchTerm}
      />

      {/* API Key Error Modal */}
      <APIKeyErrorModal
        isOpen={showAPIKeyErrorModal}
        onClose={() => setShowAPIKeyErrorModal(false)}
        onSuccess={handleAPIKeyUpdated}
        errorMessage={apiErrorMessage}
      />
    </div>
  )
}
