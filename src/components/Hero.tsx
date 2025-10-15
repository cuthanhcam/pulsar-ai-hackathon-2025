'use client'

import { useState } from 'react'
import { Command, Globe, Paperclip, Sparkles } from 'lucide-react'

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState("Learn about 'React Router' for building single-page applications")
  const [duration, setDuration] = useState(30)

  const popularTopics = [
    'React Basics',
    'JavaScript ES6+',
    'Python Programming',
    'Machine Learning',
    'Data Structures',
    'Web Development',
    'TypeScript',
    'Node.js',
    'Docker & Kubernetes',
    'System Design'
  ]

  return (
    <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-24 px-4 overflow-hidden min-h-[85vh] flex items-center">
      {/* Animated Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Main Title with Gradient */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              AI Tutor
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Knowledge Systematization
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform any topic into a structured learning path powered by AI
          </p>
        </div>

        {/* Search Card with Glassmorphism */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          {/* Search Input with Icons */}
          <div className="relative mb-6">
            <div className="flex items-center gap-4 border-2 border-gray-200 rounded-xl p-4 bg-gray-50/50 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Command className="w-6 h-6 text-blue-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-gray-800 bg-transparent text-lg placeholder:text-gray-400"
                placeholder="What would you like to learn today?"
              />
              <div className="flex items-center gap-3 border-l-2 border-gray-200 pl-3">
                <button title="Language">
                  <Globe className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
                </button>
                <button title="Attach file">
                  <Paperclip className="w-6 h-6 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Generate Button with Duration */}
          <div className="flex items-center gap-4">
            <a href="/course" className="flex-1">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Generate Learning Path
                <Sparkles className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
              </button>
            </a>
            <div className="flex items-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 hover:border-blue-300 transition-colors">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-16 outline-none text-center bg-transparent font-semibold text-gray-700 text-lg"
                min="10"
                max="120"
              />
              <span className="text-gray-600 text-sm font-medium">min</span>
            </div>
          </div>
        </div>

        {/* Popular Topics with Gradient Badges */}
        <div className="text-center">
          <p className="text-gray-300 mb-6 font-semibold text-lg flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            Trending Topics
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setSearchTerm(`Learn about '${topic}' and its fundamentals`)}
                className="group px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-blue-600 hover:to-blue-700 text-white rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 hover:border-blue-500 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
