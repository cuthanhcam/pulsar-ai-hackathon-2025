'use client'

import { useState } from 'react'
import { ArrowLeft, LayoutGrid, Network } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import TopBanner from '@/components/TopBanner'
import HeaderNew from '@/components/HeaderNew'
import SectionModal from '@/components/SectionModalNew'
import { mockCourse } from '@/data/mockCourse'

const CourseVisualization = dynamic(
  () => import('@/components/CourseVisualization'),
  { ssr: false }
)

export default function CoursePage() {
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'mindmap' | 'outline'>('mindmap')

  const handleLessonClick = (lessonId: string) => {
    // Find the lesson and its module
    for (const mod of mockCourse.modules) {
      const lesson = (mod.lessons || []).find((l: any) => l.id === lessonId)
      if (lesson) {
        setSelectedSection({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || 15,
          content: lesson.content || ''
        })
        setSelectedModule({
          title: mod.title
        })
        return
      }
    }
  }

  const handleSectionComplete = (sectionId: string) => {
    // For mock course, just log completion (no state update needed)
    console.log('Section completed:', sectionId)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <TopBanner />
      <HeaderNew />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/ai-tutor">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{mockCourse.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{mockCourse.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'mindmap'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              Mind Map
            </button>
            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'outline'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Outline
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {viewMode === 'mindmap' ? (
            <div className="h-[calc(100vh-250px)]">
              <CourseVisualization
                course={mockCourse}
                onLessonClick={handleLessonClick}
              />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {mockCourse.modules.map((module) => {
                const lessons = module.lessons || []
                return (
                  <div key={module.id} className="bg-slate-800 rounded-lg p-5">
                    <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{module.description}</p>
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson.id)}
                          className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                        >
                          <span className="text-white font-medium">{lesson.title}</span>
                          <span className="text-slate-400 text-sm">{lesson.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
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
          course={{
            title: mockCourse.title,
            difficulty: mockCourse.difficulty || 'Beginner'
          }}
          onSectionComplete={handleSectionComplete}
        />
      )}
    </div>
  )
}
