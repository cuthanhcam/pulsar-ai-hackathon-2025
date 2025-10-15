'use client'

import { useState } from 'react'
import { X, Key, AlertTriangle, Loader2 } from 'lucide-react'

interface APIKeyErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  errorMessage?: string
}

export default function APIKeyErrorModal({ isOpen, onClose, onSuccess, errorMessage }: APIKeyErrorModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập Gemini API key')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/user/update-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey.trim() })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Success
        alert('✅ API key đã được cập nhật thành công!')
        setApiKey('')
        onSuccess()
        onClose()
      } else {
        setError(data.message || 'Không thể lưu API key. Vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Error saving API key:', err)
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-br from-white via-red-50 to-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-red-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">API Key Error</h2>
              <p className="text-red-100 text-sm">Cần cập nhật API key</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Message */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700 font-bold mb-2">
              ⚠️ Lỗi Generate Course
            </p>
            <p className="text-xs text-red-600 mb-2">
              {errorMessage || 'Failed to generate course'}
            </p>
            <p className="text-xs text-red-600">
              API key có thể không hợp lệ, đã hết hạn, hoặc chưa được cấp quyền truy cập Gemini models.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
            <p className="text-sm text-orange-900 font-bold mb-2">
              📝 Hướng dẫn lấy API Key:
            </p>
            <ol className="text-xs text-orange-800 space-y-1 list-decimal list-inside">
              <li>Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-semibold">Google AI Studio</a></li>
              <li>Đăng nhập với Google Account</li>
              <li>Click "Create API key"</li>
              <li>Chọn project hoặc tạo mới</li>
              <li>Copy API key và paste vào ô bên dưới</li>
            </ol>
            <p className="text-xs text-orange-700 mt-2 font-medium">
              ✅ Đảm bảo API key có quyền truy cập <span className="font-bold">Gemini API</span>
            </p>
          </div>

          {/* API Key Input */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Gemini API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              placeholder="AIza..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Lấy API key tại:{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveApiKey}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Cập nhật'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

