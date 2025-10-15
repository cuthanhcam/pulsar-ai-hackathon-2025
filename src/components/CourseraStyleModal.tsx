'use client'

import { X, ChevronRight, BookOpen, Clock, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

interface Section {
  id: string
  title: string
  duration: number
  order: number
  content?: string
  completed?: boolean
}

interface Module {
  id: string
  title: string
  description?: string
  sections: Section[]
}

interface CourseraStyleModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
  modules: Module[]
  initialSectionId?: string
}

export default function CourseraStyleModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  modules,
  initialSectionId
}: CourseraStyleModalProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(initialSectionId || null)
  const [sectionContent, setSectionContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Auto-select first section if none selected
  useEffect(() => {
    if (isOpen && !activeSectionId && modules.length > 0) {
      // Find first module with sections
      const firstModuleWithSections = modules.find(m => m.sections && m.sections.length > 0)
      if (firstModuleWithSections) {
        setActiveSectionId(firstModuleWithSections.sections[0].id)
        // Expand first module
        setExpandedModules(new Set([firstModuleWithSections.id]))
      }
    }
  }, [isOpen, activeSectionId, modules])

  // Fetch content when section changes
  useEffect(() => {
    if (activeSectionId) {
      fetchSectionContent(activeSectionId)
    }
  }, [activeSectionId])

  const fetchSectionContent = async (sectionId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // First, try to GET existing content
      const getResponse = await fetch(`/api/sections/${sectionId}`)
      
      if (getResponse.ok) {
        const data = await getResponse.json()
        
        // If content exists and is substantial, use it
        if (data.content && data.content.trim().length > 100) {
          setSectionContent(data.content)
          setLoading(false)
          return
        }
      }

      // If no content or too short, generate new content
      console.log('[Modal] Generating content for section:', sectionId)
      const generateResponse = await fetch(`/api/sections/${sectionId}`, {
        method: 'POST'
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await generateResponse.json()
      setSectionContent(data.content)
    } catch (err) {
      console.error('[Modal] Error fetching section:', err)
      setError(err instanceof Error ? err.message : 'Failed to load content')
      setSectionContent('')
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleSectionClick = (sectionId: string) => {
    setActiveSectionId(sectionId)
  }

  const findCurrentSection = () => {
    for (const module of modules) {
      if (!module.sections || module.sections.length === 0) continue
      const section = module.sections.find(s => s.id === activeSectionId)
      if (section) return { module, section }
    }
    return null
  }

  const currentData = findCurrentSection()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex">
      {/* Sidebar - Course Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">Course Content</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-600 line-clamp-1">{courseTitle}</p>
        </div>

        {/* Modules & Sections List */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((module, moduleIdx) => {
            const isExpanded = expandedModules.has(module.id)
            const sections = module.sections || []
            const totalDuration = sections.reduce((sum, s) => sum + s.duration, 0)
            const completedCount = sections.filter(s => s.completed).length

            return (
              <div key={module.id} className="border-b border-gray-100">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">
                      {moduleIdx + 1}. {module.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalDuration} min
                      </span>
                      <span>{completedCount}/{sections.length} completed</span>
                    </div>
                  </div>
                </button>

                {/* Sections List */}
                {isExpanded && sections.length > 0 && (
                  <div className="bg-gray-50">
                    {sections.map((section, sectionIdx) => {
                      const isActive = section.id === activeSectionId

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.id)}
                          className={`w-full px-4 py-3 pl-11 flex items-start gap-3 transition-colors text-left ${
                            isActive
                              ? 'bg-blue-50 border-l-4 border-blue-600'
                              : 'hover:bg-gray-100 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {section.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm mb-1 ${
                              isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
                            }`}>
                              {sectionIdx + 1}. {section.title}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {section.duration} min
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Content Header */}
        {currentData && (
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{currentData.module.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentData.section.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentData.section.duration} minutes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Generating content...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 font-medium mb-2">Failed to load content</div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => activeSectionId && fetchSectionContent(activeSectionId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : sectionContent ? (
              <article className="prose prose-slate max-w-none">
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2" {...props} />,
                    code: ({ node, inline, className, children, ...props }: any) =>
                      inline ? (
                        <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={`block bg-slate-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono ${className}`} {...props}>
                          {children}
                        </code>
                      ),
                    pre: ({ node, ...props }) => <pre className="mb-4 overflow-hidden rounded-lg" {...props} />,
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border-collapse border border-gray-300" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 px-4 py-2" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic" {...props} />
                    ),
                  }}
                >
                  {sectionContent}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a section to view its content</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {currentData && (
          <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Close
            </button>
            <button
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
