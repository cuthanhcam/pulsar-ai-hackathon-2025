'use client'

import { X, Clock, BookOpen, CheckCircle, Bot, Send, Zap, FileText, ArrowRight, Sparkles, Minimize2 } from 'lucide-react'
import { useState } from 'react'

interface LessonModalProps {
  isOpen: boolean
  onClose: () => void
  lessonData: {
    id: string
    title: string
    module: string
    course: string
    duration: string
    level: string
    progress: number
    content?: string  // Actual markdown content from DB
  }
}

export default function LessonModal({ isOpen, onClose, lessonData }: LessonModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content')
  const [chatMessage, setChatMessage] = useState('')
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(false)

  if (!isOpen) return null

  // Use actual content from DB if available, otherwise fallback to mock
  const content = lessonData.content || `# ${lessonData.title}\n\nContent not available yet.`
  
  // Parse objectives from content (look for bullet points after "Mục tiêu")
  const objectives = content.match(/(?:Mục tiêu|objectives?):?\s*([\s\S]*?)(?:\n#{2,}|\n\*\*[^*]+\*\*|$)/i)?.[1]
    ?.split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean) || [
      'Hoàn thành bài học này',
      'Hiểu các khái niệm chính',
      'Áp dụng kiến thức vào thực tế'
    ]

  // Parse exercises from content
  const exercises = content.match(/(?:Bài tập|exercises?):?\s*([\s\S]*?)(?:\n#{2,}|$)/i)?.[1]
    ?.split('\n')
    .filter(line => line.trim().match(/^\d+\.|^[-*]/))
    .map(line => line.replace(/^\d+\.\s*|^[-*]\s*/, '').trim())
    .filter(Boolean) || [
      'Ôn tập nội dung bài học',
      'Thực hành các ví dụ được cung cấp',
      'Áp dụng vào dự án thực tế'
    ]

  const suggestedQuestions = [
    'Explain this concept in more detail',
    'Give examples of practical applications',
    'Summarize the main points',
    'Are there any related exercises?',
    'How to understand this topic deeper?',
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-2 sm:p-4">
      <div 
        className="bg-gradient-to-br from-white via-aiblue-50 to-white rounded-lg shadow-2xl w-[95vw] sm:w-[90vw] md:w-[85vw] max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col p-4 sm:p-6 pb-2 border-b border-aiblue-100 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-aiblue-600 text-xs mb-1">
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{lessonData.course}</span>
                <ArrowRight className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{lessonData.module}</span>
              </div>
              {/* Title */}
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-aiblue-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-aiblue-600 flex-shrink-0" />
                <span className="break-words whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-[250px] xs:max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
                  {lessonData.title}
                </span>
              </h2>
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {lessonData.duration}
              </span>
              <div className="inline-flex items-center border font-semibold rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-800 border-gray-200">
                <BookOpen className="w-3 h-3 mr-1" />
                {lessonData.level}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">{lessonData.progress}%</span>
                <div className="relative overflow-hidden rounded-full w-16 sm:w-20 h-1.5 bg-gray-100">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                    style={{ width: `${lessonData.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="inline-flex h-10 items-center justify-center rounded-md text-muted-foreground mt-2 flex-shrink-0 bg-aiblue-50 p-0.5">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-1 text-xs sm:text-sm py-1.5 justify-center whitespace-nowrap rounded-sm px-3 font-medium ring-offset-background transition-all ${
                activeTab === 'content'
                  ? 'bg-white text-aiblue-700 shadow-sm'
                  : 'hover:text-aiblue-600'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Content</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1 text-xs sm:text-sm py-1.5 justify-center whitespace-nowrap rounded-sm px-3 font-medium ring-offset-background transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-aiblue-700 shadow-sm'
                  : 'hover:text-aiblue-600'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Knowledge Quiz</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-grow flex flex-col overflow-hidden relative">
          {activeTab === 'content' && (
            <>
              {/* Content Scroll Area */}
              <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4">
                {/* Lesson Content */}
                <div className="prose prose-sm max-w-full">
                  {/* Objectives */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mục tiêu bài học</h3>
                    <p className="text-gray-700 mb-3">Sau khi hoàn thành bài học này, bạn có thể:</p>
                    <ul className="space-y-2">
                      {objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Main Content */}
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                  </div>

                  {/* Practice Exercises */}
                  <div className="bg-green-50 rounded-xl p-4 mb-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bài tập thực hành</h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {exercises.map((exercise, index) => (
                        <li key={index} className="text-gray-700">{exercise}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* AI Assistant Section */}
              <div className="border-t border-aiblue-100 flex-shrink-0">
                <div className="p-2 bg-gradient-to-r from-aiblue-700 to-aiblue-500 rounded-t-lg flex items-center gap-2">
                  <div className="h-7 w-7 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Sparkles className="text-white h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-sm text-white drop-shadow-sm">AI Assistant</span>
                    <div className="text-xs text-aiblue-100">PulsarTeam</div>
                  </div>
                  <button 
                    onClick={() => setIsAIChatMinimized(!isAIChatMinimized)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Minimize2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>

                {!isAIChatMinimized && (
                  <div className="bg-gradient-to-b from-transparent to-aiblue-50/30 p-2 sm:p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                    {/* Suggested Questions */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1 h-3.5 bg-aiblue-500 rounded-full"></div>
                        <p className="text-[10px] font-medium text-aiblue-600">You might want to ask:</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={index}
                            className="text-[10px] py-1 px-2 bg-white border border-aiblue-200 text-aiblue-700 rounded-md hover:bg-aiblue-50 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="sticky bottom-0 backdrop-blur-sm bg-white/80 border border-aiblue-100 rounded-lg p-2">
                      <div className="flex gap-2 items-end">
                        <textarea
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Type your question..."
                          className="flex-1 resize-none min-h-8 py-1.5 px-3 rounded-xl shadow-sm bg-white border border-aiblue-200 hover:border-aiblue-300 text-sm focus:outline-none focus:ring-2 focus:ring-aiblue-400 transition-all"
                          rows={1}
                        />
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-yellow-100/80 border border-yellow-200">
                            <Zap className="h-3 w-3 text-yellow-600" />
                            <span className="text-[10px] font-medium text-yellow-700">5</span>
                          </div>
                          <button
                            disabled={!chatMessage.trim()}
                            className={`rounded-full shadow-sm p-2 transition-all ${
                              chatMessage.trim()
                                ? 'bg-gradient-to-r from-aiblue-700 to-aiblue-500 hover:from-aiblue-800 hover:to-aiblue-600 text-white'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'quiz' && (
            <div className="flex-grow flex items-center justify-center p-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-aiblue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Knowledge Quiz</h3>
                <p className="text-gray-600">Quiz functionality coming soon!</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between p-3 sm:p-4 border-t border-aiblue-100 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs h-7 border border-aiblue-200 text-aiblue-700 hover:bg-aiblue-50 rounded-md transition-colors"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-aiblue-700 to-aiblue-500 hover:from-aiblue-800 hover:to-aiblue-600 text-white text-xs h-7 rounded-md transition-all ml-auto flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
        </div>

        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}
