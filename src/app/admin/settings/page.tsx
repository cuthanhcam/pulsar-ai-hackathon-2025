'use client'

import { useState, useEffect } from 'react'
import { Settings, Coins, Users, BookOpen, Shield, Bell, Zap, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

interface PlatformSettings {
  // Credits & Pricing
  defaultCredits: number
  creditPriceUSD: number
  creditPriceVND: number
  
  // User Management
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxCoursesPerUser: number
  
  // Course Settings
  autoApproveCourses: boolean
  maxModulesPerCourse: number
  allowPublicCourses: boolean
  
  // System
  maintenanceMode: boolean
  allowNewSignups: boolean
  rateLimit: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    defaultCredits: 500,
    creditPriceUSD: 10,
    creditPriceVND: 230000,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxCoursesPerUser: 50,
    autoApproveCourses: true,
    maxModulesPerCourse: 20,
    allowPublicCourses: true,
    maintenanceMode: false,
    allowNewSignups: true,
    rateLimit: 60
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    setError('')

    try {
      // Simulate API call - in production, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store in localStorage for now
      localStorage.setItem('platformSettings', JSON.stringify(settings))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem('platformSettings')
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-zinc-400">Configure platform settings and preferences</p>
      </div>

      {/* Alert Messages */}
      {saved && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400 font-medium">Settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Credits & Pricing Settings */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <Coins className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Credits & Pricing</h2>
              <p className="text-sm text-zinc-400">Configure credit system and pricing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Default Credits for New Users
              </label>
              <input
                type="number"
                value={settings.defaultCredits}
                onChange={(e) => setSettings({ ...settings, defaultCredits: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Free credits given on signup</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Credit Price (USD)
              </label>
              <input
                type="number"
                value={settings.creditPriceUSD}
                onChange={(e) => setSettings({ ...settings, creditPriceUSD: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Price per 1000 credits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Credit Price (VND)
              </label>
              <input
                type="number"
                value={settings.creditPriceVND}
                onChange={(e) => setSettings({ ...settings, creditPriceVND: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Price per 1000 credits</p>
            </div>
          </div>
        </div>

        {/* User Management Settings */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <p className="text-sm text-zinc-400">Configure user registration and limits</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div>
                <p className="font-medium text-white">Registration Enabled</p>
                <p className="text-sm text-zinc-400">Allow new users to register</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.registrationEnabled ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.registrationEnabled ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div>
                <p className="font-medium text-white">Email Verification Required</p>
                <p className="text-sm text-zinc-400">Users must verify email before login</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailVerificationRequired: !settings.emailVerificationRequired })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.emailVerificationRequired ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.emailVerificationRequired ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Max Courses Per User
              </label>
              <input
                type="number"
                value={settings.maxCoursesPerUser}
                onChange={(e) => setSettings({ ...settings, maxCoursesPerUser: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Maximum courses a user can create</p>
            </div>
          </div>
        </div>

        {/* Course Settings */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Course Settings</h2>
              <p className="text-sm text-zinc-400">Configure course creation and moderation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div>
                <p className="font-medium text-white">Auto-Approve Courses</p>
                <p className="text-sm text-zinc-400">Courses are published immediately</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoApproveCourses: !settings.autoApproveCourses })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.autoApproveCourses ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoApproveCourses ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div>
                <p className="font-medium text-white">Allow Public Courses</p>
                <p className="text-sm text-zinc-400">Users can share courses publicly</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowPublicCourses: !settings.allowPublicCourses })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.allowPublicCourses ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.allowPublicCourses ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Max Modules Per Course
              </label>
              <input
                type="number"
                value={settings.maxModulesPerCourse}
                onChange={(e) => setSettings({ ...settings, maxModulesPerCourse: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Maximum modules allowed in a course</p>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Settings</h2>
              <p className="text-sm text-zinc-400">Critical system configurations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
              <div>
                <p className="font-medium text-white">Maintenance Mode</p>
                <p className="text-sm text-zinc-400">Disable platform for maintenance</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-600'
                }`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-7' : ''
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                API Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                value={settings.rateLimit}
                onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500/50 transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1">Maximum API requests per user per minute</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-medium text-white">Save Changes</p>
              <p className="text-sm text-zinc-400">Apply new settings to the platform</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

