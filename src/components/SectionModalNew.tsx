'use client'

import { X, Clock, Loader2, BookOpen, Send, Sparkles, MessageCircle, CheckCircle, Trophy, Zap, Copy, Check, Minimize2, Maximize2, Bot } from 'lucide-react'
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
  onSectionComplete?: (sectionId: string) => void
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export default function SectionModalNew({ 
  isOpen, 
  onClose, 
  section, 
  module, 
  course,
  onSectionComplete
}: SectionModalProps) {
  
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content')
  
  // Quiz state
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({})
  const [showResults, setShowResults] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  
  // Completion state
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (isOpen && section.id) {
      loadSectionContent()
      // Check if section is already completed
      setIsCompleted((section as any).completed || false)
    }
  }, [isOpen, section.id])

  useEffect(() => {
    if (chatEndRef.current && isChatOpen && !isChatMinimized) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, isChatOpen, isChatMinimized])

  const handleMarkAsComplete = async () => {
    setIsCompleting(true)
    try {
      const response = await fetch(`/api/sections/${section.id}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsCompleted(true)
        // Call callback to update parent state
        if (onSectionComplete) {
          onSectionComplete(section.id)
        }
        // Show success message briefly then close
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError('Failed to mark as complete')
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
      setError('Failed to mark as complete')
    } finally {
      setIsCompleting(false)
    }
  }

  const loadSectionContent = async () => {
    if (section.content) {
      setSectionContent(section.content)
      return
    }

    setIsLoadingContent(true)
    setError(null)

    // Create AbortController with 5 minute timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes

    try {
      const response = await fetch(`/api/sections/${section.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setSectionContent(data.content || '')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Không thể tải nội dung')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout. Vui lòng thử lại.')
      } else {
      setError('Lỗi kết nối. Vui lòng thử lại.')
      }
    } finally {
      setIsLoadingContent(false)
    }
  }

  const handleCopyCode = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(codeId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `Lỗi: ${errorData.error || 'Không thể trả lời'}` 
        }])
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `Lỗi kết nối: ${err instanceof Error ? err.message : 'Unknown'}` 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true)
    setQuizError(null)
    
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
        setQuizError(null)
      } else {
        const errorData = await response.json()
        setQuizError(errorData.error || 'Không thể tạo quiz')
      }
    } catch (err) {
      setQuizError('Lỗi kết nối. Vui lòng thử lại.')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[92vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span className="hover:underline cursor-pointer">{course.title}</span>
              <span className="text-gray-400">→</span>
              <span className="hover:underline cursor-pointer">{module.title}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">
                {section.title}
              </h1>
                  </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {section.duration || 9} Minutes
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                {course.difficulty || 'Intermediate'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">100%</span>
                <div className="w-24 h-2 bg-blue-600 rounded-full"></div>
                </div>
              {/* AI Assistant Toggle Icon */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors group"
                title="Toggle AI Assistant"
              >
                <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* Tabs - Segmented Control Style */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'content' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'bg-transparent text-gray-600 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Content
            </button>
            <button 
              onClick={() => {
                setActiveTab('quiz')
                if (!quiz && !isGeneratingQuiz) {
                  handleGenerateQuiz()
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-white shadow-sm text-gray-900 font-semibold' 
                  : 'bg-transparent text-gray-600 hover:bg-white/50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Quiz
            </button>
          </div>
        </div>

        {/* Body - Main Content with AI Sidebar */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Main Content Area */}
          <div className={`${isChatOpen ? 'flex-1' : 'w-full'} overflow-y-auto bg-white transition-all duration-300`}>
            {activeTab === 'content' ? (
              // Content Tab
              isLoadingContent ? (
              <div className="flex flex-col items-center justify-center h-full px-8">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">Đang tạo nội dung chi tiết...</p>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  AI đang phân tích và tạo nội dung chuyên nghiệp cho bài học này
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Thời gian dự kiến: 30-90 giây</span>
                </div>
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                  <p className="text-xs text-blue-800 text-center">
                    💡 <strong>Mẹo:</strong> Nội dung được tạo một lần duy nhất. Lần sau sẽ load ngay lập tức!
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
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
            ) : (
              <div className="relative overflow-hidden flex-grow h-full code-block-container max-w-full bg-white">
                <div className="h-full w-full rounded-[inherit] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                  <div className="w-full">
                    <div className="py-8 px-6 sm:px-12 md:px-16 lg:px-20 w-full max-w-6xl mx-auto overflow-visible">
                      {/* Main Content */}
                      <div className="prose prose-sm max-w-none w-full break-words overflow-visible mobile-lesson-content">
                        <ReactMarkdown 
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            pre: ({ node, children, ...props }) => {
                              const codeElement = children && Array.isArray(children) ? children[0] : null
                              const codeContent = codeElement && typeof codeElement === 'object' && 'props' in codeElement
                                ? String(codeElement.props.children).replace(/\n$/, '')
                                : ''
                              const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                              
                              return (
                                <div className="relative w-full max-w-full my-4">
                                  <button
                                    onClick={() => handleCopyCode(codeContent, codeId)}
                                    className="absolute right-2 top-2 p-1.5 rounded-md bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
                                    aria-label="Copy code"
                                  >
                                    {copiedCode === codeId ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                  <div className="w-full max-w-full overflow-hidden">
                                    <pre 
                                      className="rounded-md !mt-0 !mb-0"
                                      style={{
                                        color: 'rgb(248, 248, 242)',
                                        background: 'rgb(40, 42, 54)',
                                        textShadow: 'rgba(0, 0, 0, 0.3) 0px 1px',
                                        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                                        textAlign: 'left',
                                        whiteSpace: 'pre-wrap',
                                        wordSpacing: 'normal',
                                        wordBreak: 'break-all',
                                        overflowWrap: 'normal',
                                        lineHeight: 'inherit',
                                        tabSize: 4,
                                        hyphens: 'none',
                                        padding: '1em',
                                        margin: '0.5em 0px',
                                        overflow: 'auto',
                                        borderRadius: '0.3em',
                                        maxWidth: '100%',
                                        width: '100%',
                                        fontSize: '0.85rem'
                                      }}
                                      {...props}
                                    >
                                      {children}
                                    </pre>
                                  </div>
                                </div>
                              )
                            },
                            code: ({ node, className, children, ...props }: any) => {
                              const isInline = !className?.includes('language-')
                              if (isInline) {
                                return (
                                  <code 
                                    className="px-1 py-0.5 bg-gray-100 text-[#1D4ED8] rounded text-xs break-words overflow-wrap-anywhere"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                )
                              }
                              return <code className={className} {...props}>{children}</code>
                            },
                            h1: ({ node, children, ...props }) => (
                              <h1 className="text-gray-900 no-underline font-bold text-3xl mt-8 mb-4 border-b pb-2" {...props}>
                                {children}
                              </h1>
                            ),
                            h2: ({ node, children, ...props }) => (
                              <h2 className="text-gray-900 no-underline font-bold text-2xl mt-8 mb-3" {...props}>
                                {children}
                              </h2>
                            ),
                            h3: ({ node, children, ...props }) => (
                              <h3 className="text-gray-900 no-underline font-bold text-xl mt-6 mb-3" {...props}>
                                {children}
                              </h3>
                            ),
                            h4: ({ node, children, ...props }) => (
                              <h4 className="text-gray-900 no-underline font-bold text-lg mt-5 mb-2" {...props}>
                                {children}
                              </h4>
                            ),
                            p: ({ node, children, ...props }) => (
                              <p className="my-4 leading-7" {...props}>{children}</p>
                            ),
                            ul: ({ node, children, ...props }) => (
                              <ul className="list-disc pl-7 my-4 space-y-2" {...props}>{children}</ul>
                            ),
                            ol: ({ node, children, ...props }) => (
                              <ol className="list-decimal pl-7 my-4 space-y-2" {...props}>{children}</ol>
                            ),
                            li: ({ node, children, ...props }) => (
                              <li className="pl-1 mb-1" {...props}>{children}</li>
                            ),
                          }}
                        >
                    {sectionContent || '# Nội dung đang được tạo...\n\nContent not available yet.'}
                  </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
            ) : (
              // Quiz Tab
              <div className="h-full w-full overflow-y-auto">
                <div className="py-8 px-6 sm:px-12 md:px-16 lg:px-20 w-full max-w-5xl mx-auto">
                  {isGeneratingQuiz ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Đang tạo quiz...</h3>
                      <p className="text-gray-600 text-sm">AI đang phân tích nội dung và tạo câu hỏi</p>
                      <p className="text-gray-500 text-xs mt-2">💰 Tốn 5 credits</p>
                    </div>
                  ) : quizError ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                        <div className="text-red-600 text-lg font-semibold mb-2">Không thể tạo quiz</div>
                        <p className="text-red-500 text-sm mb-4">{quizError}</p>
                        <button
                          onClick={handleGenerateQuiz}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    </div>
                  ) : quiz && quiz.length > 0 ? (
                    <div className="space-y-8">
                      {/* Quiz Header */}
                      <div className="text-center pb-6 border-b border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Quiz</h2>
                        <p className="text-gray-600">Test hiểu kiến thức về: <span className="font-semibold text-blue-600">{section.title}</span></p>
                        <p className="text-sm text-gray-500 mt-2">{quiz.length} câu hỏi • {quiz.length * 2} phút</p>
                      </div>

                      {/* Questions */}
                      <div className="space-y-6">
                        {quiz.map((question, qIndex) => (
                          <div key={question.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">{qIndex + 1}</span>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 flex-1">{question.question}</h3>
                            </div>
                            
                            <div className="space-y-3 ml-11">
                              {question.options.map((option, oIndex) => {
                                const isSelected = selectedAnswers[question.id] === oIndex
                                const isCorrect = question.correctAnswer === oIndex
                                const showResult = showResults

                                return (
                                  <button
                                    key={oIndex}
                                    onClick={() => {
                                      if (!showResults) {
                                        setSelectedAnswers(prev => ({
                                          ...prev,
                                          [question.id]: oIndex
                                        }))
                                      }
                                    }}
                                    disabled={showResults}
                                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                      showResult
                                        ? isCorrect
                                          ? 'border-green-500 bg-green-50 text-green-900'
                                          : isSelected
                                          ? 'border-red-500 bg-red-50 text-red-900'
                                          : 'border-gray-200 bg-gray-50 text-gray-600'
                                        : isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        showResult
                                          ? isCorrect
                                            ? 'border-green-500 bg-green-500'
                                            : isSelected
                                            ? 'border-red-500 bg-red-500'
                                            : 'border-gray-300'
                                          : isSelected
                                          ? 'border-blue-500 bg-blue-500'
                                          : 'border-gray-300'
                                      }`}>
                                        {(showResult && isCorrect) || (isSelected && !showResult) ? (
                                          <Check className="w-3 h-3 text-white" />
                                        ) : null}
                                      </div>
                                      <span className="flex-1">{option}</span>
                                      {showResult && isCorrect && (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      )}
                                      {showResult && isSelected && !isCorrect && (
                                        <X className="w-5 h-5 text-red-500" />
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>

                            {/* Explanation */}
                            {showResults && (
                              <div className="ml-11 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900 mb-1">💡 Giải thích:</p>
                                <p className="text-sm text-blue-800">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Submit/Results */}
                      {!showResults ? (
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-6">
                          <div>
                            <p className="text-sm text-gray-600">
                              Đã trả lời: <span className="font-bold text-gray-900">{Object.keys(selectedAnswers).length}/{quiz.length}</span> câu
                            </p>
                          </div>
                          <button
                            onClick={handleSubmitQuiz}
                            disabled={Object.keys(selectedAnswers).length !== quiz.length}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold shadow-lg"
                          >
                            Nộp bài
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                            <span className="text-3xl font-bold text-white">{calculateScore()}%</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {calculateScore() >= 80 ? '🎉 Xuất sắc!' : calculateScore() >= 60 ? '👍 Tốt!' : '💪 Cố gắng thêm!'}
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Bạn trả lời đúng <span className="font-bold text-blue-600">
                              {quiz.filter(q => selectedAnswers[q.id] === q.correctAnswer).length}/{quiz.length}
                            </span> câu
                          </p>
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => {
                                setShowResults(false)
                                setSelectedAnswers({})
                              }}
                              className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                              Làm lại
                            </button>
                            <button
                              onClick={() => {
                                setQuiz(null)
                                setShowResults(false)
                                setSelectedAnswers({})
                                handleGenerateQuiz()
                              }}
                              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                            >
                              Quiz mới (5 credits)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Sẵn sàng kiểm tra kiến thức?</h3>
                      <p className="text-gray-600 mb-6 max-w-md">
                        AI sẽ tạo quiz dựa trên nội dung bài học này để giúp bạn củng cố kiến thức
                      </p>
                      <button
                        onClick={handleGenerateQuiz}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all font-semibold shadow-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Tạo Quiz (5 credits)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Sidebar - Right side */}
          {isChatOpen && (
            <div className="w-[420px] border-l-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30 flex flex-col animate-slide-in shadow-xl">
              {/* Chat Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      AI Assistant
                      <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-[10px] font-bold">ONLINE</span>
                    </h3>
                    <p className="text-xs text-blue-100 font-medium">Teach Pulsar • Always Ready</p>
          </div>
        </div>
          <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5 text-white" />
          </button>
        </div>

              {/* Suggestions */}
              {chatHistory.length === 0 && (
                <div className="px-5 py-4 border-b border-blue-100 bg-gradient-to-b from-blue-50 to-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Quick Questions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setChatMessage('Explain this concept in more detail')}
                      className="px-3 py-2 bg-white hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 rounded-xl text-xs text-gray-700 transition-all hover:shadow-md font-medium"
                    >
                      💡 Explain in detail
                    </button>
                    <button 
                      onClick={() => setChatMessage('Give examples of practical applications')}
                      className="px-3 py-2 bg-white hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 rounded-xl text-xs text-gray-700 transition-all hover:shadow-md font-medium"
                    >
                      🎯 Practical examples
                    </button>
                    <button
                      onClick={() => setChatMessage('Summarize the main points')}
                      className="px-3 py-2 bg-white hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 rounded-xl text-xs text-gray-700 transition-all hover:shadow-md font-medium"
                    >
                      📝 Summarize
                    </button>
                    <button
                      onClick={() => setChatMessage('How to understand this topic deeper?')}
                      className="px-3 py-2 bg-white hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 rounded-xl text-xs text-gray-700 transition-all hover:shadow-md font-medium"
                    >
                      🚀 Go deeper
                    </button>
                  </div>
                </div>
              )}

                {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {chatHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">How can I help you?</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Ask me anything about this lesson and I'll explain it in detail!</p>
                    </div>
                  ) : (
                    <>
                      {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 shadow-md flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.role === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/20'
                            : 'bg-white border-2 border-gray-100 text-gray-800 shadow-gray-200/50'
                          }`}>
                            {msg.role === 'user' ? (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-headings:text-gray-900 prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ml-2 shadow-md flex-shrink-0">
                            <span className="text-white text-sm font-bold">U</span>
                          </div>
                        )}
                        </div>
                      ))}
                      {isChatLoading && (
                      <div className="flex justify-start animate-in fade-in">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
              <div className="sticky bottom-0 backdrop-blur-sm bg-white/90 border-t border-blue-100 rounded-lg p-3 relative z-10">
                <div className="flex gap-2 items-end">
                  <div className="relative flex-grow">
                    <textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isChatLoading) {
                          e.preventDefault()
                          handleSendChat()
                        }
                      }}
                      placeholder="Type your question..."
                      className="flex w-full px-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[40px] max-h-32 py-2 pl-3 pr-8 rounded-xl shadow-sm bg-white border-2 transition-all duration-200 border-blue-200 hover:border-blue-300"
                      rows={1}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-100/80 border border-yellow-200">
                      <Zap className="h-3 w-3 text-yellow-600" />
                      <span className="text-[10px] font-medium text-yellow-700">5</span>
                    </div>
                    <button
                      onClick={handleSendChat}
                      disabled={!chatMessage.trim() || isChatLoading}
                      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 rounded-full shadow-sm flex-shrink-0 p-0 transition-all duration-200 ${
                        !chatMessage.trim() || isChatLoading 
                          ? 'bg-gray-100 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={handleMarkAsComplete}
            disabled={isCompleting || isCompleted}
            className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold ${
              isCompleted
                ? 'bg-green-600 text-white cursor-default'
                : isCompleting
                ? 'bg-orange-400 text-white cursor-wait'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Completed!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Complete
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
