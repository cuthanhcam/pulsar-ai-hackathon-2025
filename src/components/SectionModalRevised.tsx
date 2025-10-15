'use client'

import { X, Clock, Loader2, BookOpen, Send, Sparkles, Trophy, Zap, Copy, CheckCircle, ChevronDown, Bot } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
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

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export default function SectionModalRevised({ 
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
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Quiz state
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (isOpen && section.id) {
      loadSectionContent()
    }
  }, [isOpen, section.id])

  useEffect(() => {
    if (chatEndRef.current && !isChatMinimized) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, isChatMinimized])

  const loadSectionContent = async () => {
    if (section.content) {
      setSectionContent(section.content)
      return
    }

    setIsLoadingContent(true)
    setError(null)

    try {
      const response = await fetch(`/api/sections/${section.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        setSectionContent(data.content || '')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Không thể tải nội dung')
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.')
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          lessonId: section.id,
          chatHistory: chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            message: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: 'Lỗi: Không thể trả lời' 
        }])
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lỗi kết nối' 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true)
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.id,
          sectionTitle: section.title,
          moduleTitle: module.title
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQuiz(data.questions || [])
      } else {
        const errorData = await response.json()
        alert(`Lỗi: ${errorData.error || 'Không thể tạo quiz'}`)
      }
    } catch (err) {
      alert('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) correct++
    })
    return Math.round((correct / quiz.length) * 100)
  }

  const suggestedQuestions = [
    'Explain this concept in more detail',
    'Give examples of practical applications',
    'Summarize the main points',
    'Are there any related exercises?',
    'How to understand this topic deeper?'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-aiblue-600 to-aiblue-500 border-b border-aiblue-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="text-xs text-aiblue-100 font-medium mb-1 uppercase tracking-wider">
                {course.title} • {module.title}
              </div>
              <h1 className="text-xl font-bold text-white drop-shadow-sm">
                {section.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-aiblue-100">
                  <Clock className="w-4 h-4" />
                  {section.duration || 10} phút
                </span>
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                  {course.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
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
              <Trophy className="w-4 h-4" />
              Knowledge Quiz
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto" style={{ position: 'relative', '--radix-scroll-area-corner-width': '0px', '--radix-scroll-area-corner-height': '0px' } as any}>
          {activeTab === 'content' ? (
            <>
              {isLoadingContent ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-16 h-16 text-aiblue-500 animate-spin mb-4" />
                  <p className="text-lg font-medium text-gray-700">Đang tạo nội dung...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Không thể tải nội dung</div>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                      onClick={loadSectionContent}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pb-2 px-6 w-full max-w-full overflow-visible">
                  <div className="prose prose-sm max-w-full w-full break-words overflow-visible mobile-lesson-content relative">
                    <div className="markdown-content prose-code:break-words prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:whitespace-pre-wrap mobile-markdown-content">
                      <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="relative w-full max-w-full">
                              <button 
                                className="absolute right-2 top-2 p-1.5 rounded-md bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
                                onClick={() => {
                                  const code = props.children?.toString() || ''
                                  navigator.clipboard.writeText(code)
                                }}
                                aria-label="Copy code"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <pre className="rounded-md !mt-0 overflow-auto" {...props} />
                            </div>
                          ),
                          h1: ({ node, ...props }) => (
                            <h1 className="text-gray-900 no-underline font-bold text-3xl mt-8 mb-4 border-b pb-2" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-gray-900 no-underline font-bold text-2xl mt-8 mb-3" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-gray-900 no-underline font-bold text-xl mt-6 mb-3" {...props} />
                          ),
                          code: ({ node, inline, ...props }: any) => 
                            inline ? (
                              <code className="px-1 py-0.5 bg-gray-100 text-[#1D4ED8] rounded text-xs break-words overflow-wrap-anywhere" {...props} />
                            ) : (
                              <code {...props} />
                            ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-7 my-4 space-y-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-7 my-4 space-y-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-1 mb-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-4 leading-7" {...props} />
                          )
                        }}
                      >
                        {sectionContent || '# Nội dung đang được tạo...\n\nContent not available yet.'}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* AI Chat Assistant - Sticky Bottom */}
                  <div className="mt-4 border-t border-aiblue-100 pt-3 max-w-full overflow-hidden">
                    <div className="p-2 bg-gradient-to-r from-aiblue-700 to-aiblue-500 rounded-lg shadow-sm flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Sparkles className="text-white h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm text-white drop-shadow-sm">AI Assistant</span>
                        <div className="text-xs text-aiblue-100">NeyGen Insight</div>
                      </div>
                      <button 
                        onClick={() => setIsChatMinimized(!isChatMinimized)}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 text-white transition-transform ${isChatMinimized ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {!isChatMinimized && (
                      <div className="relative flex-grow overflow-y-auto bg-gradient-to-b from-transparent to-aiblue-50/30 rounded-lg p-2 transition-all duration-500 ease-in-out ai-chat-container min-h-[350px] max-h-[450px]">
                        <div className="flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3 px-0.5">
                            <div className="flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span className="text-sm font-medium text-[#1D4ED8]">AI Assistant</span>
                            </div>
                          </div>

                          <div className="flex-grow flex flex-col overflow-hidden justify-between">
                            <div className="flex-grow overflow-y-auto pb-2">
                              {chatHistory.length === 0 ? (
                                <div className="mt-2 relative z-20 mb-10">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <div className="w-1 h-3.5 bg-aiblue-500 rounded-full"></div>
                                    <p className="text-[10px] font-medium text-aiblue-600">You might want to ask:</p>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {suggestedQuestions.map((q, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          setChatMessage(q)
                                          handleSendChat()
                                        }}
                                        className="text-[10px] py-1 px-2 bg-white border border-aiblue-200 text-aiblue-700 rounded-md hover:bg-aiblue-50 transition-colors break-words text-left"
                                      >
                                        {q}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                      <div className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        msg.role === 'user'
                                          ? 'bg-aiblue-600 text-white'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {msg.role === 'user' ? (
                                          <p>{msg.content}</p>
                                        ) : (
                                          <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {isChatLoading && (
                                    <div className="text-left mb-3">
                                      <div className="inline-block bg-gray-100 rounded-lg px-3 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-aiblue-600" />
                                      </div>
                                    </div>
                                  )}
                                  <div ref={chatEndRef} />
                                </>
                              )}
                            </div>

                            <div className="sticky bottom-0 backdrop-blur-sm bg-white/80 border border-aiblue-100 rounded-lg p-2 relative z-10">
                              <div className="flex gap-2 items-end">
                                <textarea
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleSendChat()
                                    }
                                  }}
                                  className="flex w-full px-3 text-sm resize-none min-h-8 py-1.5 rounded-xl shadow-sm bg-white border transition-all duration-200 border-aiblue-200 hover:border-aiblue-300 focus:outline-none focus:ring-2 focus:ring-aiblue-400"
                                  placeholder="Type your question..."
                                  rows={1}
                                />
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-100/80 border border-yellow-200">
                                    <Zap className="h-3 w-3 text-yellow-600" />
                                    <span className="text-[10px] font-medium text-yellow-700">5</span>
                                  </div>
                                  <button
                                    onClick={handleSendChat}
                                    disabled={!chatMessage.trim() || isChatLoading}
                                    className="h-8 w-8 rounded-full shadow-sm p-0 transition-all duration-200 bg-aiblue-600 hover:bg-aiblue-700 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    <Send className="h-3.5 w-3.5 text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Quiz Tab Content
            <div className="p-6">
              {!quiz ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Knowledge Quiz</h3>
                  <p className="text-gray-600 mb-6">Kiểm tra kiến thức của bạn với 5 câu hỏi</p>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang tạo quiz...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Tạo Quiz (5 credits)
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {quiz.map((q, idx) => (
                    <div key={q.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                      <p className="font-semibold text-gray-900 mb-4">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-3">
                        {q.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => !showResults && setSelectedAnswers(prev => ({...prev, [q.id]: optIdx}))}
                            disabled={showResults}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                              showResults
                                ? optIdx === q.correctAnswer
                                  ? 'bg-green-50 border-green-500 text-green-900'
                                  : selectedAnswers[q.id] === optIdx
                                  ? 'bg-red-50 border-red-500 text-red-900'
                                  : 'bg-gray-50 border-gray-200 text-gray-500'
                                : selectedAnswers[q.id] === optIdx
                                ? 'bg-aiblue-50 border-aiblue-500 text-aiblue-900'
                                : 'bg-white border-gray-300 hover:border-aiblue-400 text-gray-700'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {option}
                          </button>
                        ))}
                      </div>
                      {showResults && q.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>💡 Giải thích:</strong> {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!showResults ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length !== quiz.length}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Nộp bài
                    </button>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center">
                      <div className="text-5xl font-bold text-purple-600 mb-2">{calculateScore()}%</div>
                      <p className="text-lg text-purple-700">
                        {calculateScore() >= 80 ? '🎉 Xuất sắc!' : calculateScore() >= 60 ? '👍 Tốt lắm!' : '💪 Cố gắng thêm!'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Bạn trả lời đúng {Object.values(selectedAnswers).filter((ans, idx) => ans === quiz[idx].correctAnswer).length}/{quiz.length} câu
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg transition-colors text-sm font-medium"
          >
            Đóng
          </button>
          <button
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
          >
            <CheckCircle className="w-4 h-4" />
            Hoàn thành bài học
          </button>
        </div>
      </div>
    </div>
  )
}
