'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Search, Eye, Trash2, Loader2, User, Calendar, Trophy, Filter, LayoutGrid, List, Layers, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Users, Crown } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  topic: string
  difficulty: string
  createdAt: string
  userId: string
  user: {
    id: string
    email: string
    name: string | null
  }
  _count: {
    modules: number
  }
}

interface TopCreator {
  userId: string
  courseCount: number
  email: string
  name: string | null
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [topCreators, setTopCreators] = useState<TopCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'modules'>('date')
  const [selectedCreator, setSelectedCreator] = useState<string>('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  })
  const [showTopCreators, setShowTopCreators] = useState(false)

  useEffect(() => {
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, sortBy, selectedCreator])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        ...(selectedCreator && { userId: selectedCreator })
      })
      
      const res = await fetch(`/api/admin/courses?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses || [])
        setPagination(data.pagination)
        setTopCreators(data.topCreators || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"?\n\nThis will also delete all modules and sections.`)) return

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert('Course deleted successfully')
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty

    return matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }

  const stats = {
    total: pagination.totalCount,
    beginner: courses.filter(c => c.difficulty.toLowerCase() === 'beginner').length,
    intermediate: courses.filter(c => c.difficulty.toLowerCase() === 'intermediate').length,
    advanced: courses.filter(c => c.difficulty.toLowerCase() === 'advanced').length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
        <p className="text-zinc-400">View and manage all courses created by users</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-orange-400" />
            <span className="text-xs font-medium text-orange-400/70 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
          <p className="text-sm text-orange-300/70">All Courses</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-green-400" />
            <span className="text-xs font-medium text-green-400/70 uppercase tracking-wider">Beginner</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.beginner}</p>
          <p className="text-sm text-green-300/70">Easy Level</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-8 h-8 text-blue-400" />
            <span className="text-xs font-medium text-blue-400/70 uppercase tracking-wider">Intermediate</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.intermediate}</p>
          <p className="text-sm text-blue-300/70">Medium Level</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8 text-purple-400" />
            <span className="text-xs font-medium text-purple-400/70 uppercase tracking-wider">Advanced</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.advanced}</p>
          <p className="text-sm text-purple-300/70">Hard Level</p>
        </div>
      </div>

      {/* Top Creators Section */}
      {topCreators.length > 0 && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Top Course Creators</h2>
            </div>
            <button
              onClick={() => setShowTopCreators(!showTopCreators)}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              {showTopCreators ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showTopCreators && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {topCreators.slice(0, 5).map((creator, index) => (
                <button
                  key={creator.userId}
                  onClick={() => {
                    setSelectedCreator(selectedCreator === creator.userId ? '' : creator.userId)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    selectedCreator === creator.userId
                      ? 'bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'bg-zinc-800/30 border-zinc-700 hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className={`w-4 h-4 ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-400' :
                      'text-zinc-500'
                    }`} />
                    <span className={`text-2xl font-bold ${
                      selectedCreator === creator.userId ? 'text-orange-400' : 'text-white'
                    }`}>
                      {creator.courseCount}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    {creator.name || creator.email}
                  </p>
                  <p className="text-xs text-zinc-600 truncate">{creator.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-zinc-800/50 rounded-lg px-4 py-3">
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, topic, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-zinc-500"
            />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'modules')}
              className="bg-zinc-800/50 text-white border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="date">Latest First</option>
              <option value="title">A to Z</option>
              <option value="modules">Most Modules</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-zinc-800/50 text-white border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterDifficulty !== 'all' || selectedCreator) && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-zinc-400">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium">
                Search: {searchQuery}
              </span>
            )}
            {filterDifficulty !== 'all' && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium capitalize">
                {filterDifficulty}
              </span>
            )}
            {selectedCreator && (
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                Creator: {topCreators.find(c => c.userId === selectedCreator)?.name || 'Selected'}
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterDifficulty('all')
                setSelectedCreator('')
              }}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Courses Display */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading courses...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-12">
          <div className="text-center">
            <BookOpen className="w-20 h-20 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-zinc-400 mb-6">
              {searchQuery || filterDifficulty !== 'all'
                ? 'Try adjusting your filters'
                : 'No courses have been created yet'}
            </p>
            {(searchQuery || filterDifficulty !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterDifficulty('all')
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
              {/* Card Header with Gradient */}
              <div className="bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent p-6 border-b border-zinc-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <BookOpen className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/course/${course.id}`, '_blank')}
                      className="p-2 bg-zinc-800/50 hover:bg-blue-500/20 border border-zinc-700 hover:border-blue-500/50 rounded-lg transition-all group/btn"
                      title="View course"
                    >
                      <Eye className="w-4 h-4 text-zinc-400 group-hover/btn:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-2 bg-zinc-800/50 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-all group/btn"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4 text-zinc-400 group-hover/btn:text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Topic Tag */}
                <div>
                  <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium">
                    {course.topic}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">{course._count.modules} modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">{new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className={`px-3 py-2 rounded-lg border text-sm font-medium text-center ${getDifficultyColor(course.difficulty)}`}>
                  <Trophy className="w-4 h-4 inline-block mr-1" />
                  <span className="capitalize">{course.difficulty}</span>
                </div>

                {/* Creator Info */}
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500">Created by</p>
                      <p className="text-sm text-white truncate">{course.user.name || course.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6 hover:border-orange-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30 shrink-0">
                  <BookOpen className="w-6 h-6 text-orange-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium">
                          {course.topic}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                        <span className="text-zinc-500">
                          <Layers className="w-4 h-4 inline-block mr-1" />
                          {course._count.modules} modules
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(`/course/${course.id}`, '_blank')}
                        className="p-2 bg-zinc-800/50 hover:bg-blue-500/20 border border-zinc-700 hover:border-blue-500/50 rounded-lg transition-all group"
                        title="View course"
                      >
                        <Eye className="w-5 h-5 text-zinc-400 group-hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="p-2 bg-zinc-800/50 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/50 rounded-lg transition-all group"
                        title="Delete course"
                      >
                        <Trash2 className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 pt-3 border-t border-zinc-800 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{course.user.name || course.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredCourses.length > 0 && (
        <div className="mt-8 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-zinc-400">
              Showing <span className="text-white font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="text-white font-semibold">
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
              </span> of{' '}
              <span className="text-white font-semibold">{pagination.totalCount}</span> courses
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-zinc-700 hover:border-orange-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 transition-all group"
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5 text-zinc-400 group-hover:text-orange-400" />
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-zinc-700 hover:border-orange-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 transition-all group"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-orange-400" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        pagination.page === pageNum
                          ? 'bg-orange-500 border-orange-500 text-white font-semibold'
                          : 'border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-zinc-700 hover:border-orange-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 transition-all group"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-orange-400" />
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-zinc-700 hover:border-orange-500/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-700 transition-all group"
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5 text-zinc-400 group-hover:text-orange-400" />
              </button>
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="bg-zinc-800/50 text-white border border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-orange-500/50 transition-colors"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

