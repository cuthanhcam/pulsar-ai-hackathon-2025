'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Key, Save, ArrowLeft, Eye, EyeOff, Loader2, Zap, AlertCircle, CheckCircle2, User, Mail, Phone, Lock } from 'lucide-react'
import Link from 'next/link'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'

// Lazy load canvas for better performance
const TechCanvas = dynamic(() => import('@/components/TechCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function SettingsPage() {
  const sessionInfo = useSession()
  const session = sessionInfo?.data
  const status = sessionInfo?.status
  const router = useRouter()
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [currentApiKey, setCurrentApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingKey, setFetchingKey] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number>(0)
  
  // Profile update states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Defer canvas loading to improve initial render time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCanvas(true)
    }, 100) // Load canvas after 100ms to prioritize content

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchCurrentKey = async () => {
      if (!session?.user?.id) return

      try {
        setFetchingKey(true)
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        
        if (response.ok) {
          // Check if user has API key set
          if (data.hasApiKey || data.user?.hasApiKey) {
            // Show masked indicator that key exists
            setCurrentApiKey('AIza••••••••••••••••••••••••••••••••') // Masked for security
            setGeminiApiKey('') // Keep input empty for new key entry
          }
          if (typeof data.credits === 'number') {
            setCredits(data.credits)
          }
          // Load profile data
          if (data.user) {
            setProfileData(prev => ({
              ...prev,
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || ''
            }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      } finally {
        setFetchingKey(false)
      }
    }

    if (status === 'authenticated') {
      fetchCurrentKey()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const handleSave = async () => {
    if (!geminiApiKey.trim()) {
      setError('API Key cannot be empty')
      return
    }

    if (!geminiApiKey.startsWith('AIza')) {
      setError('Invalid API Key format. Gemini API keys start with "AIza"')
      return
    }

    if (geminiApiKey.length < 30) {
      setError('API Key seems too short. Please check and try again.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiApiKey.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentApiKey(geminiApiKey.trim())
        setSuccess('API Key updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update API Key')
      }
    } catch (err) {
      setError('Failed to update API Key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return key
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4)
  }

  const handleProfileUpdate = async () => {
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    // Validation
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setProfileError('Name and email are required')
      setProfileLoading(false)
      return
    }

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setProfileError('New passwords do not match')
      setProfileLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim(),
          phone: profileData.phone.trim(),
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setProfileSuccess(data.message || 'Profile updated successfully!')
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        setTimeout(() => setProfileSuccess(''), 5000)
      } else {
        setProfileError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setProfileError('Failed to update profile. Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Canvas Background - Deferred loading for performance */}
      {showCanvas && (
        <>
          <div className="fixed inset-0 z-0">
            <TechCanvas />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950"></div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        <TopBanner />
        <HeaderNew />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <div className="w-1.5 h-12 bg-orange-500"></div>
              <div className="w-1.5 h-12 bg-white/60"></div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Account</div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                Settings
              </h1>
            </div>
          </div>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Manage your API keys, credits, and account preferences
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 backdrop-blur-md border-2 border-green-500/50 rounded-xl flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-400 font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-md border-2 border-red-500/50 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {profileSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 backdrop-blur-md border-2 border-green-500/50 rounded-xl flex items-start gap-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-400 font-semibold">{profileSuccess}</p>
          </div>
        )}

        {profileError && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-md border-2 border-red-500/50 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 font-semibold">{profileError}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Section */}
            <div className="bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 border-2 border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-white mb-1">Personal Information</h2>
                  <p className="text-sm text-zinc-400">Update your account details</p>
                </div>
              </div>

              {fetchingKey ? (
                <div className="flex items-center gap-3 text-zinc-400 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm font-semibold">Loading your information...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileInputChange}
                        className="w-full px-4 py-3 pl-11 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="John Doe"
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange}
                        className="w-full px-4 py-3 pl-11 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="john@example.com"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileInputChange}
                        className="w-full px-4 py-3 pl-11 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="+84 123 456 789"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-zinc-800 my-6"></div>

                  {/* Change Password Section */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Change Password (Optional)</h3>
                    
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={profileData.currentPassword}
                            onChange={handleProfileInputChange}
                            className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter current password"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={profileData.newPassword}
                            onChange={handleProfileInputChange}
                            className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Enter new password (min 6 characters)"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={profileData.confirmPassword}
                            onChange={handleProfileInputChange}
                            className="w-full px-4 py-3 pl-11 pr-11 bg-zinc-900 border-2 border-zinc-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Confirm new password"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Profile Button */}
                  <button
                    onClick={handleProfileUpdate}
                    disabled={profileLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* API Key Section */}
            <div className="bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-500/10 border-2 border-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Key className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-white mb-1">Gemini API Key</h2>
                  <p className="text-sm text-zinc-400">Required for AI course generation</p>
                  {currentApiKey && (
                    <div className="inline-flex items-center gap-2 mt-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Configured</span>
                    </div>
                  )}
                </div>
              </div>
              
              {fetchingKey ? (
                <div className="flex items-center gap-3 text-zinc-400 py-8 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-sm font-semibold">Loading current key...</span>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <input
                      id="geminiApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder={currentApiKey ? currentApiKey : "AIzaSy... (paste your API key here)"}
                      className="w-full px-4 py-4 bg-zinc-800 border-2 border-zinc-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm pr-12 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      title={showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {currentApiKey && (
                    <div className="flex items-center gap-2 text-xs mb-4">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-semibold">API Key configured</span>
                      {!showApiKey && (
                        <span className="text-zinc-500 font-mono ml-2">
                          ({maskApiKey(currentApiKey)})
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-xl">
                    <p className="text-sm text-zinc-300">
                      Get your FREE API key from{' '}
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-400 font-bold underline transition-colors"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="bg-zinc-900/70 backdrop-blur-md border-2 border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 border-2 border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Why API Key?</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Your Gemini API Key enables AI-powered course generation and chat responses. 
                    We use your personal key to ensure you have full control over usage and quota.
                    Your key is securely stored and only used for your requests.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 Column */}
          <div className="space-y-6">
            {/* Credits Card */}
            <div className="bg-gradient-to-br from-orange-500/10 to-zinc-900/90 backdrop-blur-xl border-2 border-orange-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-orange-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Credits</h3>
                    <p className="text-xs text-zinc-400">Available balance</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-5xl font-black text-white mb-2">{credits}</div>
                  <div className="text-xs text-orange-500 uppercase tracking-wider font-bold">Credits remaining</div>
                </div>
                
                <div className="h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${Math.min((credits / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span>Course generation</span>
                    </div>
                    <span className="font-bold text-orange-400">30 credits</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>Quiz generation</span>
                    </div>
                    <span className="font-bold text-green-400">5 credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-4">Account Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Name</div>
                  <div className="text-sm text-white font-semibold">{session.user.name || 'User'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Email</div>
                  <div className="text-sm text-white font-semibold truncate">{session.user.email || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
