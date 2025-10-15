'use client'

import { X, Clock, CheckCircle, Loader2, BookOpen, Send, Sparkles, MessageCircle, Target } from 'lucide-react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

interface SectionModalProps {
  isOpen: boolean
  onClose: () => void
  section: {
    id: string
    title: string
    duration?: number
    content?: string
  }
  module: {
    title: string
  }
  course: {
    title: string
    difficulty?: string
  }
}

export default function SectionModal({ 
  isOpen, 
  onClose, 
  section, 
  module, 
  course
}: SectionModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content')
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  useEffect(() => {
    if (isOpen && section.id) {
      loadSectionContent()
    }
  }, [isOpen, section.id])

  const loadSectionContent = async () => {
    if (section.content && section.content.length > 100) {
      setSectionContent(section.content)
      return
    }

    setIsLoadingContent(true)
    setError(null)
    
    try {
      const getResponse = await fetch(`/api/sections/${section.id}`)
      
      if (getResponse.ok) {
        const data = await getResponse.json()
        if (data.content && data.content.length > 100) {
          setSectionContent(data.content)
          setIsLoadingContent(false)
          return
        }
      }

      const generateResponse = await fetch(`/api/sections/${section.id}`, {
        method: 'POST'
      })

      if (generateResponse.ok) {
        const data = await generateResponse.json()
        setSectionContent(data.content || '')
      } else {
        const errorData = await generateResponse.json()
        setError(errorData.error || 'Failed to load content')
      }
    } catch (err) {
      setError('An error occurred while loading content')
    } finally {
      setIsLoadingContent(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatMessage.trim() || isChatLoading) return

    const userMsg = chatMessage
    setChatMessage('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setIsChatLoading(true)

    const requestPayload = {
      message: userMsg,
      lessonId: section.id,
      chatHistory: chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        message: msg.content
      }))
    }

    console.log('🚀 [SectionModal] Sending chat request:', {
      message: userMsg,
      sectionId: section.id,
      historyLength: chatHistory.length
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      })

      console.log('📡 [SectionModal] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SectionModal] Got response:', data)
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [SectionModal] Chat error:', errorData)
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `Lỗi: ${errorData.error || 'Không thể trả lời'}. ${errorData.details || ''}` 
        }])
      }
    } catch (err) {
      console.error('💥 [SectionModal] Chat exception:', err)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Lỗi kết nối: ${err instanceof Error ? err.message : 'Unknown'}` 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-white via-aiblue-50 to-white rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden border-2 border-aiblue-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Match aiblue theme */}
        <div className="px-6 py-5 border-b-2 border-aiblue-200 bg-gradient-to-r from-aiblue-600 to-aiblue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-aiblue-100 font-medium mb-1 uppercase tracking-wide">
                {module.title}
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                {section.title}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-sm text-aiblue-100">
                  <Clock className="w-4 h-4" />
                  {section.duration || 10} phút
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-white/30">
                  {course.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'content'
                  ? 'bg-white text-aiblue-700 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Nội dung
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-aiblue-700 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              AI Trợ giúp
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'content' ? (
            <div className="h-full overflow-y-auto px-8 py-6 bg-white">
              {isLoadingContent ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Đang tạo nội dung...</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng đợi một chút</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">Không thể tải nội dung</div>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                  onClick={loadSectionContent}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : sectionContent ? (
            <article className="prose prose-lg max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-6 pb-3 border-b-2 border-indigo-200" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-5 text-lg" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-outside ml-6 my-6 space-y-3 text-gray-700" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-outside ml-6 my-6 space-y-3 text-gray-700" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-lg leading-relaxed" {...props} />
                  ),
                  code: ({ node, inline, className, children, ...props }: any) =>
                    inline ? (
                      <code className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-mono text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={`block bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-base font-mono leading-relaxed ${className}`} {...props}>
                        {children}
                      </code>
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="my-6 rounded-xl overflow-hidden shadow-lg" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-indigo-500 pl-6 py-2 my-6 bg-indigo-50 text-gray-700 italic rounded-r-lg" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-6 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-6 py-4 text-gray-700 border-t border-gray-200" {...props} />
                  ),
                }}
              >
                {sectionContent}
              </ReactMarkdown>
            </article>
          ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <BookOpen className="w-24 h-24 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có nội dung</p>
                </div>
              )}
            </div>
          ) : (
            // AI Chat Tab
            <div className="h-full flex flex-col bg-gradient-to-b from-aiblue-50/30 to-white">
              <div className="p-6 border-b border-aiblue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-aiblue-600 to-aiblue-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">AI Trợ giúp học tập</h3>
                    <p className="text-sm text-gray-600">Hỏi tôi bất cứ điều gì về bài học này</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-aiblue-100 rounded-full mb-4">
                      <Sparkles className="w-12 h-12 text-aiblue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Bắt đầu hỏi ngay!</h4>
                    <p className="text-gray-600 max-w-md mb-6">
                      Tôi có thể giải thích khái niệm, cho ví dụ, hoặc giúp bạn hiểu bài tập.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                      <button
                        onClick={() => setChatMessage('Giải thích khái niệm chính trong bài này')}
                        className="px-4 py-2 bg-white border-2 border-aiblue-200 hover:border-aiblue-400 text-aiblue-700 rounded-lg text-sm transition-colors"
                      >
                        Giải thích khái niệm chính
                      </button>
                      <button
                        onClick={() => setChatMessage('Cho tôi một ví dụ thực tế')}
                        className="px-4 py-2 bg-white border-2 border-aiblue-200 hover:border-aiblue-400 text-aiblue-700 rounded-lg text-sm transition-colors"
                      >
                        Cho ví dụ thực tế
                      </button>
                      <button
                        onClick={() => setChatMessage('Giải thích bài tập thực hành')}
                        className="px-4 py-2 bg-white border-2 border-aiblue-200 hover:border-aiblue-400 text-aiblue-700 rounded-lg text-sm transition-colors"
                      >
                        Giải thích bài tập
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-aiblue-600 to-aiblue-500 text-white'
                            : 'bg-white border-2 border-aiblue-100 text-gray-800'
                        }`}>
                          {msg.role === 'user' ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-aiblue-700 prose-code:text-aiblue-600 prose-code:bg-aiblue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border-2 border-aiblue-100 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-aiblue-600" />
                            <span className="text-sm text-gray-600">Đang suy nghĩ...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t-2 border-aiblue-200 bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isChatLoading && handleSendChat()}
                    placeholder="Nhập câu hỏi của bạn..."
                    disabled={isChatLoading}
                    className="flex-1 px-4 py-3 border-2 border-aiblue-200 rounded-xl focus:outline-none focus:border-aiblue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatMessage.trim() || isChatLoading}
                    className="px-6 py-3 bg-gradient-to-r from-aiblue-600 to-aiblue-500 hover:from-aiblue-700 hover:to-aiblue-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    Gửi
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI có thể mắc sai sót. Hãy kiểm tra thông tin quan trọng.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-aiblue-200 bg-gradient-to-r from-aiblue-50 to-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-aiblue-300 text-aiblue-700 hover:bg-aiblue-50 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
          <button
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-md"
          >
            <CheckCircle className="w-5 h-5" />
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  )
}
