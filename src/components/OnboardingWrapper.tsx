'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import OnboardingModal from './OnboardingModal'

export default function OnboardingWrapper() {
  const { data: session, status } = useSession()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCheckedApiKey, setHasCheckedApiKey] = useState(false)

  useEffect(() => {
    // Show onboarding modal when user just logged in
    if (status === 'authenticated' && session && !hasCheckedApiKey) {
      checkApiKeyAndShowModal()
    }
  }, [status, session, hasCheckedApiKey])

  const checkApiKeyAndShowModal = async () => {
    try {
      // Check if user has Gemini API key in database
      const response = await fetch('/api/user/get-api-key')
      const data = await response.json()
      
      setHasCheckedApiKey(true)
      
      // Show modal if user doesn't have API key OR hasn't seen onboarding
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
      const hasApiKey = data.geminiApiKey && data.geminiApiKey.trim().length > 0
      
      // Show modal if:
      // 1. User doesn't have API key (first login or after logout)
      // 2. OR hasn't seen onboarding yet
      if (!hasApiKey || !hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Failed to check API key:', error)
      // Show modal on error to be safe
      setShowOnboarding(true)
    }
  }

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
    // Mark as seen in localStorage for this session
    localStorage.setItem('hasSeenOnboarding', 'true')
  }

  return (
    <OnboardingModal 
      isOpen={showOnboarding} 
      onClose={handleCloseOnboarding} 
    />
  )
}

