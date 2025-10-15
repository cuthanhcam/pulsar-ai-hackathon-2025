'use client'

import { SessionProvider } from 'next-auth/react'
import OnboardingWrapper from './OnboardingWrapper'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <OnboardingWrapper />
    </SessionProvider>
  )
}
