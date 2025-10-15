'use client'

import { TrendingUp } from 'lucide-react'
import Image from 'next/image'

const topics = [
  { name: 'React', icon: '/images/topics/iconreact.png' },
  { name: 'JavaScript', icon: '/images/topics/iconjavascript.png' },
  { name: 'Python', icon: '/images/topics/iconpython.png' },
  { name: 'Machine Learning', icon: '/images/topics/iconmachinelearning.png' },
  { name: 'AI Development', icon: '/images/topics/iconaidevelopment.png' },
  { name: 'Node.js', icon: '/images/topics/iconnodejs.png' },
  { name: 'UI/UX Design', icon: '/images/topics/iconuiuxdesign.png' },
  { name: 'Data Science', icon: '/images/topics/icondatasciene.png' },
]

interface PopularTopicsNewProps {
  onTopicClick?: (topicName: string) => void
}

export default function PopularTopicsNew({ onTopicClick }: PopularTopicsNewProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-4 h-4 text-orange-500" />
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Trending Topics</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-800 to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => onTopicClick?.(topic.name)}
            className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 p-5 text-left rounded-xl opacity-60 hover:opacity-100"
            style={{
              transform: 'none',
              transitionDelay: `${index * 50}ms`
            }}
          >
            {/* Orange glow on hover */}
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-12 relative opacity-65">
                  <Image
                    src={topic.icon}
                    alt={topic.name}
                    width={48}
                    height={48}
                    className="object-contain icon-white group-hover:icon-orange transition-all duration-300"
                  />
                </div>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-tight">
                {topic.name}
              </h4>
              <div className="flex items-center gap-2 mt-3 text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">
                <div className="w-5 h-px bg-zinc-800 group-hover:bg-orange-500 transition-colors"></div>
                <span>Explore</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
