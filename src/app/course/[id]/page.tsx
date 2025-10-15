'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Map, List, Sparkles, Target, Clock, BookOpen, CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import SectionModal from '@/components/SectionModalNew'

const CourseVisualization = dynamic(
  () => import('@/components/CourseVisualization'),
  { ssr: false, loading: () => (
    <div className="h-[80vh] flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading visualization...</p>
      </div>
    </div>
  )}
)

export default function DynamicCoursePage() {
  const params = useParams()
  const router = useRouter()
  const sessionInfo = useSession()
  const session = sessionInfo?.data
  const status = sessionInfo?.status
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'mindmap' | 'outline'>('mindmap')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Only fetch when authenticated and have course id
    if (params.id && status === 'authenticated') {
      fetchCourse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, status])  // Depend on status instead of session object

  const fetchCourse = async () => {
    try {
      console.log('[Frontend] Fetching course:', params.id)
      const response = await fetch(`/api/lessons/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('[Frontend] Course data received:', {
          title: data.lesson?.title,
          modulesCount: data.lesson?.modules?.length,
          modulesData: data.lesson?.modules?.map((m: any) => ({
            title: m.title,
            lessonsCount: m.lessons?.length || 0,
            sectionsCount: m.sections?.length || 0,
            hasLessons: !!m.lessons,
            hasSections: !!m.sections
          }))
        })
        setCourse(data.lesson)
      } else {
        console.error('[Frontend] Failed to fetch:', response.status)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('[Frontend] Failed to fetch course:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSectionClick = (sectionId: string, moduleId?: string) => {
    // Find section and module (support both old lessons and new sections)
    for (const mod of course.modules || []) {
      // Try sections first
      let section = (mod.sections || []).find((s: any) => s.id === sectionId)
      
      // Fallback to lessons for old courses
      if (!section) {
        section = (mod.lessons || []).find((l: any) => l.id === sectionId)
      }
      
      if (section) {
        setSelectedSection(section)
        setSelectedModule(mod)
        return
      }
    }
  }

  const handleSectionComplete = (sectionId: string) => {
    // Update course state immediately without reload
    setCourse((prevCourse: any) => {
      if (!prevCourse) return prevCourse

      const updatedModules = prevCourse.modules.map((mod: any) => {
        // Update in sections
        if (mod.sections) {
          const updatedSections = mod.sections.map((s: any) => 
            s.id === sectionId ? { ...s, completed: true } : s
          )
          return { ...mod, sections: updatedSections }
        }
        
        // Update in lessons (for backward compatibility)
        if (mod.lessons) {
          const updatedLessons = mod.lessons.map((l: any) => 
            l.id === sectionId ? { ...l, completed: true } : l
          )
          return { ...mod, lessons: updatedLessons }
        }
        
        return mod
      })

      return { ...prevCourse, modules: updatedModules }
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  // Calculate progress
  const totalSections = course.modules?.reduce((acc: number, mod: any) => {
    return acc + ((mod.sections || mod.lessons || []).length)
  }, 0) || 0
  
  const completedSections = course.modules?.reduce((acc: number, mod: any) => {
    return acc + ((mod.sections || mod.lessons || []).filter((s: any) => s.completed).length)
  }, 0) || 0
  
  const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0

  return (
    <div className="min-h-screen bg-zinc-950">
      <TopBanner />
      <HeaderNew />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 text-white rounded-xl transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </Link>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-zinc-500 font-medium">Course</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Toggle Buttons */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 relative ${
                viewMode === 'mindmap'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {viewMode === 'mindmap' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"></div>
              )}
              <Map className="w-4 h-4" />
              <span className="font-medium">Mind Map</span>
            </button>
            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 relative ${
                viewMode === 'outline'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {viewMode === 'outline' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"></div>
              )}
              <List className="w-4 h-4" />
              <span className="font-medium">Outline</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
              <Target className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-zinc-400">{progressPercentage.toFixed(1)}% Complete</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-zinc-400">{course.modules?.length || 0} Modules</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          {viewMode === 'mindmap' ? (
            <div className="h-[80vh]">
              {course.mindmap || course.modules ? (
                <CourseVisualization
                  course={course}
                  onSectionClick={(sectionId) => handleSectionClick(sectionId)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <Map className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500">Mindmap not available</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Outline View - Factory.ai Style
            <div className="p-3 sm:p-4 md:p-6 h-[80vh] overflow-auto">
              {/* Course Header */}
              <div className="relative mb-6 sm:mb-8 md:mb-10">
                <div className="absolute -top-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full opacity-50 blur-2xl"></div>
                
                <div className="relative">
                  {/* Top badges */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                    <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-orange-400 transition-colors">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-orange-500" />
                      AI-Generated Curriculum
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="inline-flex items-center rounded-full bg-orange-500 text-white hover:bg-orange-600 text-xs sm:text-sm px-2 sm:px-3 py-0.5 font-semibold transition-colors">
                        {course.modules?.length || 0} Modules
                      </span>
                      <span className="inline-flex items-center rounded-full bg-orange-600 text-white hover:bg-orange-700 text-xs sm:text-sm px-2 sm:px-3 py-0.5 font-semibold transition-colors">
                        {totalSections} Sections
                      </span>
                    </div>
                  </div>

                  {/* Course title */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 pb-2 sm:pb-3">
                    {course.title}
                  </h1>

                  {/* Progress & Duration */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-1 sm:gap-0">
                    <div className="flex items-center text-orange-500 font-medium text-sm sm:text-base">
                      <Target className="h-4 w-4 mr-1.5" />
                      <span>{progressPercentage.toFixed(1)}% Complete</span>
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-400 flex items-center">
                      <span>{completedSections} of {totalSections} sections completed</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 sm:h-3 w-full bg-zinc-800 rounded-full overflow-hidden mb-4 sm:mb-6">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                  </div>

                  {/* Description */}
                  {course.description && (
                    <div className="bg-zinc-800/50 p-2 sm:p-4 rounded-lg border border-zinc-700 mb-2">
                      <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <div className="flex items-center bg-green-500/10 text-green-400 border border-green-500/30 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span>{completedSections} Completed</span>
                    </div>
                    <div className="flex items-center bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                      <Circle className="w-3.5 h-3.5 mr-1.5" />
                      <span>{totalSections - completedSections} Remaining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-4 sm:space-y-5">
                {course.modules?.map((mod: any, modIdx: number) => {
                  const sections = mod.sections || mod.lessons || []
                  const completedCount = sections.filter((s: any) => s.completed).length
                  const totalCount = sections.length
                  const moduleProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

                  return (
                    <div key={mod.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 sm:p-5 hover:border-orange-500/30 transition-all duration-300">
                      {/* Module Header */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-500 text-white text-xs sm:text-sm font-bold">
                              {modIdx + 1}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-white">{mod.title}</h3>
                          </div>
                          {mod.description && (
                            <p className="text-sm text-zinc-400 ml-8 sm:ml-9">{mod.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xs sm:text-sm text-zinc-500 mb-1">{completedCount}/{totalCount}</div>
                          <div className="text-xs font-medium text-orange-400">{moduleProgress.toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative h-1.5 w-full bg-zinc-700 rounded-full overflow-hidden mb-3 sm:mb-4">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500" style={{ width: `${moduleProgress}%` }}></div>
                      </div>

                      {/* Sections List */}
                      <div className="space-y-2">
                        {sections.length > 0 ? (
                          sections.map((item: any, idx: number) => (
                            <button
                              key={item.id}
                              onClick={() => handleSectionClick(item.id, mod.id)}
                              className="w-full group flex items-center justify-between p-3 sm:p-3.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-700 hover:border-orange-500/50 rounded-lg transition-all duration-300 text-left"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {item.completed ? (
                                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="text-white font-medium text-sm sm:text-base block truncate">
                                    {idx + 1}. {item.title}
                                  </span>
                                  {item.description && (
                                    <span className="text-zinc-500 text-xs block truncate mt-0.5">{item.description}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-2">
                                <span className="text-zinc-400 group-hover:text-orange-400 transition-colors text-xs sm:text-sm flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  {item.duration || 10} min
                                </span>
                                <ArrowLeft className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors rotate-180" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-zinc-500 text-sm p-3 bg-zinc-900/30 border border-zinc-700 rounded-lg text-center">
                            No sections available yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSection && selectedModule && (
        <SectionModal
          isOpen={!!selectedSection}
          onClose={() => {
            setSelectedSection(null)
            setSelectedModule(null)
          }}
          section={selectedSection}
          module={selectedModule}
          course={course}
          onSectionComplete={handleSectionComplete}
        />
      )}
    </div>
  )
}
