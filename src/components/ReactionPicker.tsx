'use client'

import { useState } from 'react'

export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'

interface ReactionPickerProps {
  onReact: (reactionType: ReactionType) => void
  currentReaction?: ReactionType | null
  className?: string
}

const reactions: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-orange-500' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-orange-500' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-orange-400' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-orange-400' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-orange-600' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: 'text-orange-600' }
]

export default function ReactionPicker({ onReact, currentReaction, className = '' }: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  let hideTimeout: NodeJS.Timeout | null = null

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout)
    }
    setShowPicker(true)
  }

  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => {
      setShowPicker(false)
    }, 300) // 300ms delay before hiding
  }

  const handleReaction = (type: ReactionType) => {
    onReact(type)
    setShowPicker(false)
  }

  const currentReactionData = reactions.find(r => r.type === currentReaction)

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Button */}
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          currentReaction
            ? `${currentReactionData?.color} font-semibold bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700`
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        }`}
      >
        <span className="text-xl">
          {currentReaction ? currentReactionData?.emoji : '👍'}
        </span>
        <span className="text-sm font-medium">
          {currentReaction ? currentReactionData?.label : 'Like'}
        </span>
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-1 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-md flex gap-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className="group relative"
              >
                <div className="text-3xl hover:scale-125 transition-transform duration-200 cursor-pointer p-1">
                  {reaction.emoji}
                </div>
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {reaction.label}
                </div>
              </button>
            ))}
          </div>
          {/* Arrow */}
          <div className="absolute left-6 -bottom-1 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45"></div>
        </div>
      )}
    </div>
  )
}

// Reaction Counter Component
interface ReactionCounterProps {
  reactions: { type: ReactionType; count: number }[]
  className?: string
}

export function ReactionCounter({ reactions: reactionCounts, className = '' }: ReactionCounterProps) {
  if (!reactionCounts || reactionCounts.length === 0) return null

  const totalCount = reactionCounts.reduce((sum, r) => sum + r.count, 0)
  const topReactions = reactionCounts.sort((a, b) => b.count - a.count).slice(0, 3)

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Top 3 Reaction Emojis */}
      <div className="flex -space-x-1">
        {topReactions.map((reaction) => {
          const emoji = reactions.find(r => r.type === reaction.type)?.emoji || '👍'
          return (
            <span
              key={reaction.type}
              className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs"
            >
              {emoji}
            </span>
          )
        })}
      </div>
      {/* Total Count */}
      <span className="text-sm text-zinc-400">
        {totalCount}
      </span>
    </div>
  )
}

