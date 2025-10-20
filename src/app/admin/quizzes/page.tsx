'use client'

import { useState, useEffect } from 'react'
import { Trophy, User, Calendar, Loader2, TrendingUp, Award } from 'lucide-react'

interface QuizResult {
  id: string
  score: number
  completedAt: string
  user: {
    email: string
    name: string | null
  }
  quiz: {
    title: string
  }
}

export default function AdminQuizzesPage() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    topScore: 0
  })

  useEffect(() => {
    fetchQuizResults()
  }, [])

  const fetchQuizResults = async () => {
    try {
      const res = await fetch('/api/admin/quizzes')
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        setStats(data.stats || { totalQuizzes: 0, avgScore: 0, topScore: 0 })
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (score >= 70) return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-red-400 bg-red-500/20 border-red-500/30'
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Quiz Results</h1>
        <p className="text-zinc-400">Monitor quiz performance and user engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-medium text-zinc-400">Total Quizzes</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalQuizzes}</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-zinc-400">Average Score</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.avgScore}%</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-medium text-zinc-400">Top Score</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.topScore}%</p>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Quiz Results</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No quiz results yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Quiz</th>
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium">Score</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-500" />
                        <div>
                          <p className="text-white font-medium">{result.user.name || 'Unknown'}</p>
                          <p className="text-sm text-zinc-400">{result.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-300">{result.quiz.title}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2 text-zinc-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

