'use client'

import { useState, useRef } from 'react'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import AdvancedSearchBoxNew from '@/components/AdvancedSearchBoxNew'
import PopularTopicsNew from '@/components/PopularTopicsNew'
import FeaturesModern from '@/components/FeaturesModern'
import Footer from '@/components/Footer'
import CourseVisualization from '@/components/CourseVisualization'
import SectionModal from '@/components/SectionModalNew'
import { Course } from '@/types/course'
import { Map, List, Loader2, Sparkles, BookOpen, Target } from 'lucide-react'

export default function AITutorPage() {
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)
  const [viewMode, setViewMode] = useState<'mindmap' | 'outline'>('mindmap')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const courseRef = useRef<HTMLDivElement>(null)

  const handleCourseGenerated = (course: Course) => {
    setGeneratedCourse(course)
    setIsLoadingCourse(false)
    
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

      const updatedModules = prevCourse.modules?.map((mod: any) => {
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

  return (
    <main className="min-h-screen bg-black">
      <TopBanner />
      <HeaderNew />
      
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.08),transparent_50%)]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-32 pb-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 text-orange-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
              <span className="text-white">Learn</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"> Anything</span>
              <br />
              <span className="text-white">With AI Guidance</span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              Transform your learning journey with personalized AI-powered courses, 
              smart assessments, and real-time guidance.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm text-zinc-500">Courses Generated</div>
              </div>
              <div className="w-px bg-zinc-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-sm text-zinc-500">Active Learners</div>
              </div>
              <div className="w-px bg-zinc-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">AI</div>
                <div className="text-sm text-zinc-500">Powered</div>
              </div>
            </div>
          </div>

          {/* Search box */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-orange-500/20 via-orange-600/20 to-orange-500/20">
              <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6">
                <AdvancedSearchBoxNew 
                  onCourseGenerated={handleCourseGenerated}
                  onGenerationStart={handleGenerationStart}
                />
              </div>
            </div>
            <PopularTopicsNew />
          </div>

          {/* Features */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: BookOpen,
                title: 'Custom Curriculum',
                description: 'AI generates personalized learning paths based on your goals'
              },
              {
                icon: Target,
                title: 'Smart Progress',
                description: 'Track your learning journey with intelligent analytics'
              },
              {
                icon: Sparkles,
                title: 'Interactive AI',
                description: 'Get instant help and explanations from AI tutor'
              }
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 hover:border-orange-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Visualization Section */}
      {(isLoadingCourse || generatedCourse) && (
        <div ref={courseRef} id="course-section" className="relative z-10 bg-black py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {isLoadingCourse ? (
                // Loading State
                <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-orange-500/30 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Generating your course...</h3>
                    <p className="text-zinc-400">This may take a few moments</p>
                  </div>
                  
                  {/* Skeleton */}
                  <div className="w-full max-w-4xl space-y-4">
                    <div className="h-32 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl animate-pulse" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : generatedCourse && (
                <>
                  {/* Toggle View */}
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 p-1 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800">
                      <button
                        onClick={() => setViewMode('mindmap')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                          viewMode === 'mindmap'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Map className="h-4 w-4" />
                        <span className="font-medium">Mind Map</span>
                      </button>
                      <button
                        onClick={() => setViewMode('outline')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                          viewMode === 'outline'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <List className="h-4 w-4" />
                        <span className="font-medium">Outline</span>
                      </button>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 overflow-hidden">
                    <div className="h-[80vh] w-full">
                      {viewMode === 'mindmap' ? (
                        <CourseVisualization
                          course={generatedCourse}
                          onSectionClick={(sectionId) => {
                            let foundLesson: any = null
                            let foundModule: any = null
                            
                            generatedCourse.modules.forEach((module) => {
                              const sections = (module as any).sections || []
                              sections.forEach((section: any) => {
                                if (section.id === sectionId) {
                                  foundLesson = section
                                  foundModule = module
                                }
                              })
                            })
                            
                            if (foundLesson && foundModule) {
                              handleLessonClick(foundLesson, foundModule)
                            }
                          }}
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
                        />
                      ) : (
                        // Outline View
                        <div className="p-8 h-full overflow-auto">
                          {/* Course Header */}
                          <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-4">
                              <Sparkles className="w-3 h-3" />
                              <span>AI-Generated Course</span>
                            </div>
                            
                            <h1 className="text-4xl font-bold text-white mb-4">
                              {generatedCourse.title}
                            </h1>
                            
                            <p className="text-zinc-400 text-lg mb-6">
                              {generatedCourse.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-300">
                                <BookOpen className="w-4 h-4 text-orange-500" />
                                <span>{generatedCourse.modules.length} Modules</span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-300">
                                <Target className="w-4 h-4 text-orange-500" />
                                <span>{generatedCourse.totalLessons} Lessons</span>
                              </div>
                            </div>
                          </div>

                          {/* Modules */}
                          <div className="space-y-6">
                            {generatedCourse.modules.map((module, moduleIndex) => {
                              const items = (module as any).sections || module.lessons || []
                              return (
                                <div key={module.id} className="rounded-xl bg-zinc-800/30 border border-zinc-700/50 overflow-hidden hover:border-orange-500/30 transition-colors">
                                  {/* Module Header */}
                                  <div className="p-6 bg-gradient-to-r from-zinc-800/50 to-transparent">
                                    <div className="flex items-start gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                                        <span className="text-orange-500 font-bold">{moduleIndex + 1}</span>
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                          {module.title}
                                        </h3>
                                        <p className="text-zinc-400 text-sm">
                                          {items.length} lessons
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lessons */}
                                  <div className="p-4 space-y-2">
                                    {items.map((item: any, itemIndex: number) => (
                                      <button
                                        key={item.id}
                                        onClick={() => handleLessonClick(item, module)}
                                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-700/50 hover:border-orange-500/50 transition-all group text-left"
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                                          <span className="text-zinc-400 text-sm group-hover:text-orange-500">{itemIndex + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-white font-medium group-hover:text-orange-500 transition-colors">
                                            {item.title}
                                          </h4>
                                          <p className="text-zinc-500 text-sm">
                                            {item.duration || 15} min
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
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
