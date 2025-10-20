'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { UserPlus, Mail, Lock, User, Sparkles, Shield, Clock, Phone } from 'lucide-react'

// Dynamic import for heavy canvas component
const NetworkCanvas = dynamic(() => import('@/components/NetworkCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1) // Step 1: Registration Form, Step 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState(['', '', '', '', '', '']) // 6-digit OTP
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step === 2 && otpExpiry) {
      const interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((otpExpiry.getTime() - now.getTime()) / 1000)
        setTimeLeft(diff > 0 ? diff : 0)
        
        if (diff <= 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [step, otpExpiry])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }
    
    setOtp(newOtp)
  }

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      // Move to step 2
      setStep(2)
      setOtpExpiry(new Date(data.expiresAt))
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid OTP')
        return
      }

      // Auto login after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.')
        router.push('/login')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setResendLoading(true)

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP')
        return
      }

      setOtpExpiry(new Date(data.expiresAt))
      setOtp(['', '', '', '', '', ''])
      
      // Show success message
      const successDiv = document.getElementById('resend-success')
      if (successDiv) {
        successDiv.style.display = 'block'
        setTimeout(() => {
          successDiv.style.display = 'none'
        }, 3000)
      }
    } catch (error) {
      setError('Failed to resend OTP')
    } finally {
      setResendLoading(false)
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
        {/* Left Side - Branding & Features */}
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
                Start Your
                <br />
                Learning Journey
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Join thousands of learners mastering new skills with AI-powered personalized courses.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">AI-Generated Courses</h3>
                  <p className="text-sm text-zinc-400">Personalized curriculum tailored to your learning style</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Secure Registration</h3>
                  <p className="text-sm text-zinc-400">Email verification with OTP for maximum security</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Track Progress</h3>
                  <p className="text-sm text-zinc-400">Visual mindmaps and detailed analytics</p>
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
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  step === 1 
                    ? 'bg-orange-500/20 border-2 border-orange-500/50' 
                    : 'bg-zinc-800/50 border-2 border-zinc-700'
                }`}>
                  <User className={`w-4 h-4 ${step === 1 ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <span className={`text-sm font-bold ${step === 1 ? 'text-orange-400' : 'text-zinc-400'}`}>1. Register</span>
                </div>
                <div className="w-8 h-0.5 bg-zinc-700"></div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  step === 2 
                    ? 'bg-orange-500/20 border-2 border-orange-500/50' 
                    : 'bg-zinc-800/50 border-2 border-zinc-700'
                }`}>
                  <Shield className={`w-4 h-4 ${step === 2 ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <span className={`text-sm font-bold ${step === 2 ? 'text-orange-400' : 'text-zinc-400'}`}>2. Verify</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-6 lg:hidden">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black text-white">PulsarTeam</span>
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                  {step === 1 ? 'Create Account' : 'Verify Email'}
                </h1>
                <p className="text-zinc-400">
                  {step === 1 ? 'Start your learning journey today' : 'Enter the OTP sent to your email'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl">
                  <p className="text-sm text-red-400 font-semibold">{error}</p>
                </div>
              )}

              {/* Step 1: Registration Form */}
              {step === 1 && (
                <form onSubmit={handleSubmitStep1} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="0912345678"
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
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Verification Code
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleSubmitStep2} className="space-y-6">
                  {/* Success message for resend */}
                  <div id="resend-success" style={{ display: 'none' }} className="p-4 bg-green-500/10 border-2 border-green-500/50 rounded-xl">
                    <p className="text-sm text-green-400 font-semibold">✓ New OTP sent successfully!</p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 border-2 border-orange-500/50 rounded-full mb-4">
                      <Mail className="w-8 h-8 text-orange-400" />
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">
                      We've sent a 6-digit verification code to<br />
                      <span className="text-white font-bold">{formData.email}</span>
                    </p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                    <Clock className={`w-4 h-4 ${timeLeft > 60 ? 'text-orange-400' : 'text-red-400'}`} />
                    <span className={`text-sm font-bold ${timeLeft > 60 ? 'text-orange-400' : 'text-red-400'}`}>
                      {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'OTP Expired'}
                    </span>
                  </div>

                  {/* OTP Input Fields */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider text-center">
                      Enter OTP Code
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || timeLeft <= 0}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Verify & Create Account
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-zinc-400 text-sm mb-2">Didn't receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading || timeLeft > 240} // Allow resend after 1 minute
                      className="text-orange-500 hover:text-orange-400 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                    {timeLeft > 240 && (
                      <p className="text-xs text-zinc-500 mt-1">Available in {formatTime(timeLeft - 240)}</p>
                    )}
                  </div>

                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                  >
                    ← Back to registration
                  </button>
                </form>
              )}

              <div className="mt-6 text-center border-t-2 border-zinc-800 pt-6">
                <p className="text-zinc-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                    Sign in
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
