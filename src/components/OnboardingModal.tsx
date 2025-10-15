'use client'

import { useState } from 'react'
import { X, LogIn, CheckCircle, ArrowRight, ArrowLeft, Key, Shield, BookOpen, BarChart3, List, Bot, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  if (!isOpen || !session) return null

  const handleContinue = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert('Please enter your Gemini API key')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/user/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey.trim() })
      })

      if (response.ok) {
        // Move to next step after saving
        handleContinue()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save API key')
      }
    } catch (error) {
      alert('Failed to save API key. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg gap-0 p-0 max-w-md bg-gradient-to-br from-white via-blue-50 to-orange-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6 px-6 pb-6 pt-6">
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-orange-900">
              {currentStep === 0 && 'Login'}
              {currentStep === 1 && 'Setup API Key'}
              {currentStep === 2 && 'Ready to create lessons!'}
            </h2>
            <div className="text-orange-700 text-sm mt-1">
              {currentStep === 0 && 'Login to save and access your course history.'}
              {currentStep === 1 && (
                <>
                  Paste the key you created from Gemini Studio here. This key is only stored in your browser.
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline ml-1"
                  >
                    Gemini Studio
                  </a>
                </>
              )}
              {currentStep === 2 && 'You have completed onboarding. Start creating personalized courses with AI Tutor - NeyGen.'}
            </div>
          </div>

          {/* Content */}
          <div>
            {/* Step 0: Login Success */}
            {currentStep === 0 && (
              <div className="flex flex-col items-center gap-4 py-4">
                {/* GitHub Button (Disabled/Logged in) */}
                <button
                  disabled
                  className="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-orange-700 to-orange-500 text-white"
                >
                  <LogIn className="h-5 w-5" />
                  Logged in
                </button>

                {/* Google Button (Disabled/Logged in) */}
                <button
                  disabled
                  className="justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background h-10 px-4 py-2 flex items-center gap-2 border-orange-200 text-orange-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                    </g>
                  </svg>
                  Logged in
                </button>

                {/* Success Alert */}
                <div 
                  role="alert" 
                  className="relative rounded-lg border p-4 mt-2 w-full max-w-xs mx-auto bg-orange-50 border-orange-200"
                >
                  <CheckCircle className="absolute left-4 top-4 h-4 w-4 text-orange-600" />
                  <div className="pl-7">
                    <h5 className="mb-1 font-medium leading-none tracking-tight text-orange-900">
                      Logged in
                    </h5>
                    <div className="text-sm text-orange-700">
                      Hello, {session.user?.name || session.user?.email || 'User'}!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Setup API Key */}
            {currentStep === 1 && (
              <div className="space-y-2 py-2">
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-orange-400" />
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-9 font-mono border-orange-200 focus:border-orange-400 focus:ring-blue-400"
                    placeholder="Please enter Gemini API key"
                  />
                </div>

                <div role="alert" className="relative w-full rounded-lg border p-4 bg-orange-50 border-orange-200">
                  <Shield className="absolute left-4 top-4 h-4 w-4 text-orange-600" />
                  <div className="pl-7">
                    <h5 className="mb-1 font-medium leading-none tracking-tight text-orange-900">
                      Security
                    </h5>
                    <div className="text-sm text-orange-700">
                      Your key is encrypted with AES-GCM and only stored in your browser, never sent to the server.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isSaving || !apiKey.trim()}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-orange-700 to-orange-500 text-white hover:from-orange-800 hover:to-orange-600"
                  >
                    {isSaving ? 'Saving...' : 'Save Gemini Key'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Ready to create lessons */}
            {currentStep === 2 && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-full max-w-md mx-auto mt-2">
                  <div className="grid gap-3">
                    {/* Feature 1: Create roadmap */}
                    <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="mt-1">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm mb-0.5">
                          Create roadmap with AI Tutor
                        </div>
                        <div className="text-xs text-orange-700/80 leading-snug">
                          Automated learning roadmap, tailored to personal goals.
                        </div>
                      </div>
                    </div>

                    {/* Feature 2: Personalize lessons */}
                    <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="mt-1">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm mb-0.5">
                          Personalize lessons & Quiz
                        </div>
                        <div className="text-xs text-orange-700/80 leading-snug">
                          Lessons and quizzes assess understanding, personalized for each learner.
                        </div>
                      </div>
                    </div>

                    {/* Feature 3: Magic Write */}
                    <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="mt-1">
                        <List className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm mb-0.5">
                          Magic Write
                        </div>
                        <div className="text-xs text-orange-700/80 leading-snug">
                          Summarize, list main ideas, compare tables from lesson content.
                        </div>
                      </div>
                    </div>

                    {/* Feature 4: AI Assistant */}
                    <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="mt-1">
                        <Bot className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm mb-0.5">
                          AI Assistant
                        </div>
                        <div className="text-xs text-orange-700/80 leading-snug">
                          Q&A, follow-up, diverse perspectives from lesson content.
                        </div>
                      </div>
                    </div>

                    {/* Feature 5: AI Explain & Visualization */}
                    <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="mt-1">
                        <Sparkles className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm mb-0.5">
                          AI Explain & Visualization
                        </div>
                        <div className="text-xs text-orange-700/80 leading-snug">
                          Explain, visualize with diagrams, illustrative examples.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {/* Pagination Dots */}
            <div className="flex justify-center space-x-1.5 max-sm:order-1">
              <button
                className={`h-2 w-2 rounded-full border border-orange-400 transition-all focus:outline-none cursor-default opacity-70 ${
                  currentStep === 0 ? 'bg-orange-600' : 'bg-orange-100'
                }`}
                aria-label="Step 1"
                type="button"
              />
              <button
                className={`h-2 w-2 rounded-full border border-orange-400 transition-all focus:outline-none cursor-default opacity-70 ${
                  currentStep === 1 ? 'bg-orange-600' : 'bg-orange-100'
                }`}
                aria-label="Step 2"
                type="button"
              />
              <button
                className={`h-2 w-2 rounded-full border border-orange-400 transition-all focus:outline-none cursor-default opacity-70 ${
                  currentStep === 2 ? 'bg-orange-600' : 'bg-orange-100'
                }`}
                aria-label="Step 3"
                type="button"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 border bg-background hover:text-accent-foreground border-orange-200 text-orange-700 hover:bg-orange-50"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
              )}
              <button
                onClick={handleSkip}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 text-orange-700 hover:text-orange-900 hover:bg-orange-50"
                type="button"
              >
                Skip
              </button>
              <button
                onClick={handleContinue}
                disabled={currentStep === 1 && !apiKey.trim()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 group bg-gradient-to-r from-orange-700 to-orange-500 text-white hover:from-orange-800 hover:to-orange-600"
                type="button"
              >
                {currentStep === 2 ? 'Okay' : 'Continue'}
                {currentStep !== 2 && <ArrowRight className="h-4 w-4 -me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  )
}

