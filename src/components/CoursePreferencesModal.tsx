'use client'

import { useState, useEffect } from 'react'
import { 
  X, ArrowRight, ArrowLeft, Sparkles, Clock, Target, BookOpen, Lightbulb
} from 'lucide-react'

interface CoursePreferences {
  learningPreference: string
  learningTime: string
  skillLevel: string
  topicsOfInterest: string[]
  instructionalMethod: string
}

interface CoursePreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (preferences: CoursePreferences) => void
  topic: string
}

export default function CoursePreferencesModal({
  isOpen,
  onClose,
  onComplete,
  topic
}: CoursePreferencesModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<CoursePreferences>({
    learningPreference: '',
    learningTime: '',
    skillLevel: '',
    topicsOfInterest: [],
    instructionalMethod: ''
  })

  const totalSteps = 5
  const progress = ((currentStep + 1) / totalSteps) * 100

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setPreferences({
        learningPreference: '',
        learningTime: '',
        skillLevel: '',
        topicsOfInterest: [],
        instructionalMethod: ''
      })
    } else if (isOpen && topic && topic.trim()) {
      // Auto-fill topic from search term when modal opens
      setPreferences(prev => ({
        ...prev,
        topicsOfInterest: [topic.trim()]
      }))
    }
  }, [isOpen, topic])

  if (!isOpen) return null

  const handleNext = () => {
    // Clean up topics before proceeding
    if (currentStep === 3) {
      const cleanedTopics = preferences.topicsOfInterest.filter(t => t.length > 0)
      setPreferences({ ...preferences, topicsOfInterest: cleanedTopics })
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final cleanup before completing
      const finalPreferences = {
        ...preferences,
        topicsOfInterest: preferences.topicsOfInterest.filter(t => t.length > 0)
      }
      onComplete(finalPreferences)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return preferences.learningPreference !== ''
      case 1:
        return preferences.learningTime !== ''
      case 2:
        return preferences.skillLevel !== ''
      case 3:
        return preferences.topicsOfInterest.filter(t => t.length > 0).length > 0
      case 4:
        return preferences.instructionalMethod !== ''
      default:
        return false
    }
  }


  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        role="dialog"
        className="bg-zinc-900 border-2 border-zinc-800 shadow-2xl rounded-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden relative max-h-[95vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: 1, transform: 'none' }}
      >
        {/* Header - Factory.ai Style */}
        <div className="bg-zinc-950 px-4 sm:px-6 py-3 border-b-2 border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-6 bg-orange-500"></div>
              <div className="w-1.5 h-6 bg-white/60"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Course Setup</span>
                <span className="text-xs font-black text-orange-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-1.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-zinc-400 hover:text-white p-1.5 border-2 border-zinc-800 hover:border-orange-500/50 transition-all rounded-lg"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-zinc-900">
          {/* Step 0: Learning Preference */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-600 border-2 border-orange-400 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Learning Preference</h2>
                <p className="text-sm text-zinc-400">How do you prefer to learn about <span className="font-bold text-orange-400">{topic}</span>?</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'visual', label: 'Visual', desc: 'Diagrams & charts', Icon: Target, color: 'text-blue-400' },
                  { value: 'hands-on', label: 'Hands-on', desc: 'Interactive', Icon: Sparkles, color: 'text-green-400' },
                  { value: 'reading', label: 'Reading', desc: 'Text & articles', Icon: BookOpen, color: 'text-purple-400' },
                  { value: 'video', label: 'Video', desc: 'Tutorials', Icon: Lightbulb, color: 'text-pink-400' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, learningPreference: option.value })}
                    className={`p-3 border-2 text-left transition-all group ${
                      preferences.learningPreference === option.value
                        ? 'border-orange-500 bg-orange-600/20'
                        : 'border-zinc-700 hover:border-orange-500/50 bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        preferences.learningPreference === option.value 
                          ? 'from-orange-500/30 to-orange-600/30' 
                          : 'from-zinc-700/30 to-zinc-800/30'
                      }`}>
                        <option.Icon className={`w-5 h-5 ${preferences.learningPreference === option.value ? 'text-orange-400' : option.color}`} />
                      </div>
                    </div>
                    <div className={`font-bold text-sm mb-0.5 ${preferences.learningPreference === option.value ? 'text-orange-400' : 'text-white'}`}>{option.label}</div>
                    <div className="text-xs text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Learning Time */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-pink-600 border-2 border-orange-400 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Learning Time</h2>
                <p className="text-sm text-zinc-400">How much time can you dedicate daily?</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '15min', label: '15 min', desc: 'Quick', Icon: Sparkles, color: 'text-yellow-400' },
                  { value: '30min', label: '30 min', desc: 'Balanced', Icon: Clock, color: 'text-blue-400' },
                  { value: '1hour', label: '1 hour', desc: 'Deep dive', Icon: BookOpen, color: 'text-purple-400' },
                  { value: '2hours', label: '2+ hours', desc: 'Intensive', Icon: Target, color: 'text-red-400' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, learningTime: option.value })}
                    className={`p-3 border-2 text-center transition-all ${
                      preferences.learningTime === option.value
                        ? 'border-orange-500 bg-orange-600/20'
                        : 'border-zinc-700 hover:border-orange-500/50 bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        preferences.learningTime === option.value 
                          ? 'from-orange-500/30 to-orange-600/30' 
                          : 'from-zinc-700/30 to-zinc-800/30'
                      }`}>
                        <option.Icon className={`w-6 h-6 ${preferences.learningTime === option.value ? 'text-orange-400' : option.color}`} />
                      </div>
                    </div>
                    <div className={`font-bold text-sm mb-0.5 ${preferences.learningTime === option.value ? 'text-orange-400' : 'text-white'}`}>{option.label}</div>
                    <div className="text-xs text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Skill Level */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 border-2 border-green-400 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Skill Level</h2>
                <p className="text-sm text-zinc-400">Your current level with <span className="font-bold text-green-400">{topic}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'beginner', label: 'Beginner', desc: 'Starting out', Icon: BookOpen, color: 'text-green-400', level: 1 },
                  { value: 'intermediate', label: 'Intermediate', desc: 'Some exp', Icon: Lightbulb, color: 'text-blue-400', level: 2 },
                  { value: 'advanced', label: 'Advanced', desc: 'Mastery', Icon: Target, color: 'text-yellow-400', level: 3 },
                  { value: 'expert', label: 'Expert', desc: 'Cutting edge', Icon: Sparkles, color: 'text-red-400', level: 4 }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, skillLevel: option.value })}
                    className={`p-3 border-2 text-left transition-all ${
                      preferences.skillLevel === option.value
                        ? 'border-green-500 bg-green-600/20'
                        : 'border-zinc-700 hover:border-green-500/50 bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${
                        preferences.skillLevel === option.value 
                          ? 'from-green-500/30 to-green-600/30' 
                          : 'from-zinc-700/30 to-zinc-800/30'
                      }`}>
                        <option.Icon className={`w-4 h-4 ${preferences.skillLevel === option.value ? 'text-green-400' : option.color}`} />
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: option.level }).map((_, i) => (
                          <div key={i} className={`w-1 h-4 ${preferences.skillLevel === option.value ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                        ))}
                      </div>
                    </div>
                    <div className={`font-bold text-sm mb-0.5 ${preferences.skillLevel === option.value ? 'text-green-400' : 'text-white'}`}>{option.label}</div>
                    <div className="text-xs text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Topics of Interest */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 border-2 border-orange-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Topics of Interest</h2>
                <p className="text-sm text-zinc-400">Areas you want to focus on</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={preferences.topicsOfInterest.join(', ')}
                    onChange={(e) => {
                      // Don't filter empty strings while typing - allow commas and spaces
                      const topics = e.target.value.split(',').map(t => t.trim())
                      setPreferences({ ...preferences, topicsOfInterest: topics })
                    }}
                    onBlur={(e) => {
                      // Clean up empty topics only on blur (when user leaves the field)
                      const topics = e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
                      setPreferences({ ...preferences, topicsOfInterest: topics })
                    }}
                    placeholder="Add more topics separated by commas..."
                    className="w-full px-4 py-3 border-2 border-orange-500 bg-zinc-800/50 focus:border-orange-400 focus:bg-zinc-800 outline-none transition-all resize-none text-white placeholder:text-zinc-500 text-sm rounded-lg"
                    rows={4}
                  />
                  {preferences.topicsOfInterest.filter(t => t.length > 0).length > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {preferences.topicsOfInterest.filter(t => t.length > 0).length} topic{preferences.topicsOfInterest.filter(t => t.length > 0).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                {/* Tags display */}
                {preferences.topicsOfInterest.filter(t => t.length > 0).length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
                    {preferences.topicsOfInterest.filter(t => t.length > 0).map((t, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-start gap-2 p-3 border-l-2 border-orange-500 bg-orange-600/10 rounded-r-lg">
                  <span className="text-base">💡</span>
                  <p className="text-xs text-zinc-400">
                    Separate with commas: <span className="text-orange-400 font-semibold">"Fundamentals, Performance, Security"</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Instructional Method */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 border-2 border-blue-400 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Teaching Method</h2>
                <p className="text-sm text-zinc-400">How should the AI tutor teach you?</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'structured', label: 'Structured', desc: 'Step-by-step', Icon: BookOpen, color: 'text-blue-400' },
                  { value: 'problem-solving', label: 'Problem-Solving', desc: 'Challenges', Icon: Target, color: 'text-purple-400' },
                  { value: 'exploratory', label: 'Exploratory', desc: 'Self-directed', Icon: Sparkles, color: 'text-cyan-400' },
                  { value: 'mentorship', label: 'Mentorship', desc: 'Guided', Icon: Lightbulb, color: 'text-orange-400' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, instructionalMethod: option.value })}
                    className={`p-3 border-2 text-left transition-all ${
                      preferences.instructionalMethod === option.value
                        ? 'border-blue-500 bg-blue-600/20'
                        : 'border-zinc-700 hover:border-blue-500/50 bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        preferences.instructionalMethod === option.value 
                          ? 'from-blue-500/30 to-blue-600/30' 
                          : 'from-zinc-700/30 to-zinc-800/30'
                      }`}>
                        <option.Icon className={`w-5 h-5 ${preferences.instructionalMethod === option.value ? 'text-blue-400' : option.color}`} />
                      </div>
                    </div>
                    <div className={`font-bold text-sm mb-0.5 ${preferences.instructionalMethod === option.value ? 'text-blue-400' : 'text-white'}`}>{option.label}</div>
                    <div className="text-xs text-zinc-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Geometric */}
        <div className="bg-zinc-950 px-4 sm:px-6 py-3 border-t-2 border-zinc-700 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-orange-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all ${
                  i === currentStep
                    ? 'w-6 bg-orange-500'
                    : i < currentStep
                    ? 'w-4 bg-orange-400'
                    : 'w-3 bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-600 border-2 border-orange-500 text-white hover:from-orange-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-sm"
          >
            <span>{currentStep === totalSteps - 1 ? 'Generate' : 'Next'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

