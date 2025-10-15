'use client'

import { X, ChevronLeft, ChevronRight, BookOpen, MessageCircle, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface EnhancedLessonModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  courseId?: string
}

export default function EnhancedLessonModal({ isOpen, onClose, lessonId, courseId }: EnhancedLessonModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content')
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai', message: string }>>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [lessonData, setLessonData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch lesson data when modal opens
  useEffect(() => {
    if (isOpen && lessonId && courseId) {
      setLoading(true)
      fetch(`/api/lessons/${courseId}`)
        .then(res => res.json())
        .then(data => {
          // Find the lesson from course data
          for (const mod of data.modules || []) {
            const lesson = mod.lessons?.find((l: any) => l.id === lessonId)
            if (lesson) {
              setLessonData({ lesson, module: mod, course: data })
              break
            }
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load lesson:', err)
          setLoading(false)
        })
    }
  }, [isOpen, lessonId, courseId])

  if (!isOpen) return null
  if (loading) return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-8">
        <p>Loading lesson...</p>
      </div>
    </div>
  )
  if (!lessonData) return null

  const currentLesson = lessonData.lesson
  const courseModule = lessonData.module

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage = chatMessage
    setChatMessage('')
    setChatHistory([...chatHistory, { role: 'user', message: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          lessonId: courseId,
          chatHistory: chatHistory
        })
      })

      const data = await response.json()

      if (response.ok) {
        setChatHistory(prev => [...prev, {
          role: 'ai',
          message: data.response
        }])
      } else {
        setChatHistory(prev => [...prev, {
          role: 'ai',
          message: 'Sorry, I encountered an error. Please try again.'
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatHistory(prev => [...prev, {
        role: 'ai',
        message: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const handlePrevious = () => {
    if (lessonIndex > 0) {
      const prevLesson = allLessons[lessonIndex - 1]
      window.location.hash = prevLesson.lesson.id
    }
  }

  const handleNext = () => {
    if (lessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[lessonIndex + 1]
      window.location.hash = nextLesson.lesson.id
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full sm:h-[95vh] sm:w-[95vw] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex-1 min-w-0">
            <div className="text-xs sm:text-sm text-indigo-600 font-semibold mb-1">{courseModule.title}</div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{currentLesson.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-white/80 transition-colors ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'content'
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            Content
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base transition-colors relative ${
              activeTab === 'quiz'
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Knowledge Quiz
            {activeTab === 'quiz' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {activeTab === 'content' ? (
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 mt-4 sm:mt-6" {...props} />,
                      p: ({node, ...props}) => <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="text-sm sm:text-base list-disc list-inside text-gray-700 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="text-sm sm:text-base list-decimal list-inside text-gray-700 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="bg-gray-100 text-indigo-600 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono" {...props} />
                        ) : (
                          <code className="block bg-slate-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono mb-3 sm:mb-4" {...props} />
                        ),
                      pre: ({node, ...props}) => <pre className="mb-3 sm:mb-4" {...props} />,
                    }}
                  >
                    {currentLesson.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 sm:mb-3">📝 Knowledge Quiz</h3>
                  <p className="text-sm sm:text-base text-amber-800">
                    Quiz feature will be available soon. Practice what you&apos;ve learned with interactive questions.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Chat Sidebar */}
          <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <p className="text-xs text-gray-600 mt-1">Ask questions about this lesson</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No messages yet. Start by asking a question!</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleSendMessage()}
                  placeholder="Ask a question..."
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chatLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={lessonIndex === 0}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg font-semibold text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-xs sm:text-sm text-gray-600">
            Lesson {lessonIndex + 1} of {allLessons.length}
          </div>

          <button
            onClick={handleNext}
            disabled={lessonIndex === allLessons.length - 1}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
