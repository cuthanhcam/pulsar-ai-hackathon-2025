'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import AdvancedSearchBoxNew from '@/components/AdvancedSearchBoxNew'
import PopularTopicsNew from '@/components/PopularTopicsNew'
import FeaturesModern from '@/components/FeaturesModern'
import Footer from '@/components/Footer'
import CourseVisualization from '@/components/CourseVisualization'
import SectionModal from '@/components/SectionModalNew'
import { Course } from '@/types/course'
import { Map, List, Loader2, Sparkles, Target, Zap } from 'lucide-react'

// Dynamic import for heavy canvas component
const NetworkCanvas = dynamic(() => import('@/components/NetworkCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-950" />
})

export default function AITutorPage() {
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [viewMode, setViewMode] = useState<'mindmap' | 'outline'>('mindmap')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const courseRef = useRef<HTMLDivElement>(null)

  const handleCourseGenerated = (course: Course) => {
    setGeneratedCourse(course)
    setIsLoadingCourse(false)
    
    // Scroll to course section after a short delay
    setTimeout(() => {
      courseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  const handleGenerationStart = () => {
    setIsLoadingCourse(true)
    setGeneratedCourse(null)
  }

  const handleLessonClick = (lesson: any, module: any) => {
    setSelectedSection({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration || 15,
      content: lesson.content || ''
    })
    setSelectedModule({
      title: module.title
    })
    setIsModalOpen(true)
  }

  const handleSectionComplete = (sectionId: string) => {
    // Update course state immediately without reload
    setGeneratedCourse((prevCourse: Course | null) => {
      if (!prevCourse) return prevCourse

      // Deep clone to ensure React detects the change
      const updatedModules = prevCourse.modules?.map((mod: any) => {
        // Update in sections
        if (mod.sections) {
          const hasSection = mod.sections.some((s: any) => s.id === sectionId)
          if (hasSection) {
            const updatedSections = mod.sections.map((s: any) => 
              s.id === sectionId ? { ...s, completed: true } : { ...s }
            )
            return { ...mod, sections: updatedSections }
          }
        }
        
        // Update in lessons (for backward compatibility)
        if (mod.lessons) {
          const hasLesson = mod.lessons.some((l: any) => l.id === sectionId)
          if (hasLesson) {
            const updatedLessons = mod.lessons.map((l: any) => 
              l.id === sectionId ? { ...l, completed: true } : { ...l }
            )
            return { ...mod, lessons: updatedLessons }
          }
        }
        
        return { ...mod }
      })

      // Create completely new course object with updated timestamp to force re-render
      return { 
        ...prevCourse, 
        modules: updatedModules,
        _updateKey: Date.now() // Force re-render
      } as Course
    })
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <TopBanner />
      <HeaderNew />
      
      {/* Hero Section - Factory.ai Network Style */}
      <div className="relative overflow-hidden bg-zinc-950">
        {/* Animated Network Canvas - Factory.ai Style */}
        <div className="absolute inset-0 h-full">
          <NetworkCanvas />
        </div>

        {/* Dark Overlay for better readability */}
        <div className="absolute inset-0 h-full bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/90"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 h-full bg-gradient-radial from-transparent via-zinc-950/30 to-zinc-950/70"></div>

        {/* Hero Content - Left Aligned Factory Style */}
        <div className="relative">
          <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-16 sm:pb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Left Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">AI LEARNING</span>
              </div>
              
                {/* Main Title - Factory.ai Typography */}
                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight text-white mb-0">
                    AI-Powered
                    <br />
                    Learning
                  <br />
                    <span className="text-zinc-400">Platform</span>
                </h1>
              </div>
              
                {/* Subtitle */}
                <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed font-normal">
                  The only learning platform that generates personalized courses instantly. From IDE to deployment—master any subject with AI-crafted curriculum.
                </p>

                {/* Search Box */}
                <div className="max-w-2xl">
                  <AdvancedSearchBoxNew 
                    onCourseGenerated={handleCourseGenerated}
                    onGenerationStart={handleGenerationStart}
                    externalSearchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                  />
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span className="text-zinc-500 font-medium">AI-Generated Courses</span>
                  </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <span className="text-zinc-500 font-medium">Personalized Learning</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-zinc-500 font-medium">Interactive Content</span>
                  </div>
              </div>
            </div>

              {/* Right Side - Trending Topics */}
              <div className="hidden lg:block">
                <PopularTopicsNew onTopicClick={setSearchTerm} />
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Only show when no course */}
      {!generatedCourse && !isLoadingCourse && (
        <div className="bg-zinc-950 py-16 border-t border-zinc-900">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturesModern />
          </div>
        </div>
      )}

      {/* Course Visualization Section */}
      {(isLoadingCourse || generatedCourse) && (
        <div ref={courseRef} id="course-section" className="bg-zinc-950 py-16 border-t border-zinc-900">
          <div className="container mx-auto px-4 md:px-6 max-w-[95vw]">
            <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-6 md:p-8 overflow-hidden">
            {isLoadingCourse ? (
              // Loading State
              <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-orange-500/30 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Crafting your course...</h3>
                    <p className="text-sm text-zinc-400">AI is generating personalized content</p>
                </div>
                  {/* Skeleton */}
                <div className="w-full max-w-4xl space-y-4 animate-pulse">
                    <div className="h-32 bg-zinc-800 rounded-2xl border border-zinc-700" />
                  <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-zinc-800 rounded-2xl border border-zinc-700" />
                      <div className="h-24 bg-zinc-800 rounded-2xl border border-zinc-700" />
                      <div className="h-24 bg-zinc-800 rounded-2xl border border-zinc-700" />
                  </div>
                </div>
              </div>
            ) : generatedCourse && (
              <>
                  {/* Toggle Buttons */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-full p-1.5">
                    <button
                      onClick={() => setViewMode('mindmap')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-200 ${
                        viewMode === 'mindmap'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                        <Map className="w-4 h-4" />
                        <span>Mind Map</span>
                    </button>
                    <button
                      onClick={() => setViewMode('outline')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all duration-200 ${
                        viewMode === 'outline'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Outline</span>
                    </button>
                  </div>
                </div>

                {/* Course Content */}
                <div className="h-[80vh] w-full">
                  {viewMode === 'mindmap' ? (
                    <CourseVisualization
                      key={(generatedCourse as any)._updateKey || generatedCourse.id}
                      course={generatedCourse}
                      onLessonClick={(lessonId) => {
                        let foundLesson: any = null
                        let foundModule: any = null
                        
                          generatedCourse.modules.forEach((module) => {
                          const lessons = module.lessons || []
                          lessons.forEach((lesson) => {
                            if (lesson.id === lessonId) {
                              foundLesson = lesson
                              foundModule = module
                            }
                          })
                        })
                        
                        if (foundLesson && foundModule) {
                          handleLessonClick(foundLesson, foundModule)
                        }
                      }}
                      onModuleClick={(moduleId) => {
                        const foundModule = generatedCourse.modules.find(m => m.id === moduleId)
                        
                        if (foundModule) {
                          const lessons = foundModule.lessons || []
                          if (lessons.length > 0) {
                            handleLessonClick(lessons[0], foundModule)
                          }
                        }
                      }}
                    />
                  ) : (
                    // Outline View
                      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-3 sm:p-4 md:p-6 h-full overflow-auto">
                      {/* Course Header */}
                      <div className="relative mb-6 sm:mb-8 md:mb-10">
                          <div className="absolute -top-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-50 blur-2xl"></div>
                        
                        <div className="relative">
                          {/* Top badges */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                              <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-orange-600">
                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-orange-500" />
                              AI-Generated Curriculum
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="inline-flex items-center rounded-full bg-orange-600 text-white hover:bg-orange-700 text-xs sm:text-sm px-2 sm:px-3 py-0.5 font-semibold">
                                {generatedCourse.modules.length} Modules
                              </span>
                                <span className="inline-flex items-center rounded-full bg-orange-700 text-white hover:bg-orange-800 text-xs sm:text-sm px-2 sm:px-3 py-0.5 font-semibold">
                                {generatedCourse.totalLessons} Lessons
                              </span>
                            </div>
                          </div>

                          {/* Course title */}
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 border-b border-orange-100 pb-2 sm:pb-3">
                            {generatedCourse.title}
                          </h1>

                          {/* Progress & Duration */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-1 sm:gap-0">
                              <div className="flex items-center text-orange-700 font-medium text-sm sm:text-base">
                                <Target className="h-4 w-4 mr-1.5" />
                              <span>0.0% Complete</span>
                            </div>
                              <div className="text-xs sm:text-sm text-zinc-400 flex items-center">
                                <span>2 weeks</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                            <div className="relative h-2 sm:h-3 w-full bg-zinc-800 rounded-full overflow-hidden mb-4 sm:mb-6">
                              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-500 rounded-full" style={{ width: '0%' }}></div>
                          </div>

                          {/* Description */}
                            <div className="bg-orange-50/50 p-2 sm:p-4 rounded-lg border border-orange-100 mb-2">
                              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                              {generatedCourse.description}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <div className="flex items-center bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                              <span>0 Completed</span>
                            </div>
                            <div className="flex items-center bg-amber-50 text-amber-700 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                              <span>{generatedCourse.totalLessons} Remaining</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Curriculum Structure */}
                      <div className="mb-4 sm:mb-6">
                          <h2 className="text-xs sm:text-sm font-semibold text-orange-800 uppercase tracking-wide mb-2 sm:mb-4 flex items-center">
                          CURRICULUM STRUCTURE
                        </h2>
                        
                        <div className="space-y-2 sm:space-y-4">
                          {generatedCourse.modules.map((module, moduleIndex) => {
                            const lessons = module.lessons || []
                            return (
                                <div key={module.id} className="border-2 overflow-hidden transition-all duration-300 rounded-2xl shadow-md border-orange-200 bg-zinc-800/50">
                                {/* Module Header */}
                                <div 
                                  onClick={() => {
                                    const lessons = module.lessons || []
                                    if (lessons.length > 0) {
                                      handleLessonClick(lessons[0], module)
                                    } else {
                                      alert(`Module "${module.title}" chưa có bài học nào. Vui lòng chọn module khác.`)
                                    }
                                  }}
                                    className="bg-orange-50/70 px-3 sm:px-5 py-3 sm:py-4 hover:bg-orange-50/90 group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 text-left w-full">
                                      <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors border-2 bg-orange-100 text-orange-600 border-orange-300">
                                        <span className="text-sm font-black">{moduleIndex + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white group-hover:text-orange-700 text-base whitespace-normal break-words">
                                        Module {moduleIndex + 1}: {module.title}
                                      </div>
                                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                        <span className="flex items-center">
                                          {lessons.length} bài học
                                        </span>
                                        <span className="flex items-center">
                                          0% hoàn thành
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Lessons */}
                                  <div className="border-t border-orange-100 bg-gradient-to-b from-orange-50/40 to-transparent">
                                  <div className="pt-1 pb-1 flex flex-col gap-2">
                                    {lessons.map((lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        onClick={() => handleLessonClick(lesson, module)}
                                          className="group flex flex-col sm:flex-row items-start sm:items-center px-3 sm:px-5 py-3 sm:py-4 cursor-pointer transition-all relative rounded-xl border-2 border-zinc-700 bg-zinc-800/50 hover:border-orange-200 hover:bg-orange-50/30"
                                      >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border bg-zinc-700 text-zinc-400 border-zinc-600 group-hover:bg-orange-100 group-hover:text-orange-600 group-hover:border-orange-300">
                                              <span className="text-xs font-bold">{lessonIndex + 1}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <h3 className="font-medium text-sm sm:text-base transition-colors text-white group-hover:text-orange-700">
                                                {lesson.title}
                                            </h3>
                                              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                                              <span className="flex items-center">
                                                {lesson.duration || '15 Minutes'}
                                              </span>
                                              <span className="flex items-center">
                                                Basic
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {isModalOpen && selectedSection && selectedModule && (
        <SectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedSection(null)
            setSelectedModule(null)
          }}
          section={selectedSection}
          module={selectedModule}
          course={{
            title: generatedCourse?.title || 'Course',
            difficulty: 'Beginner'
          }}
          onSectionComplete={handleSectionComplete}
        />
      )}

      <Footer />
    </main>
  )
}
