'use client'

import { Handle, Position } from 'reactflow'
import { FolderOpen, CheckCircle } from 'lucide-react'

interface ModuleNodeProps {
  data: {
    label: string
    description: string
    completed: boolean
    lessonCount: number
    completedCount?: number
    completionPercentage?: number
    moduleNumber?: number
    onClick?: () => void
  }
}

export default function ModuleNode({ data }: ModuleNodeProps) {
  const percentage = data.completionPercentage || 0
  const completedCount = data.completedCount || 0
  
  // Determine color based on completion
  const getModuleColor = () => {
    if (percentage === 100) return 'from-green-600 to-green-700 border-green-400/50'
    if (percentage >= 50) return 'from-blue-600 to-blue-700 border-blue-400/50'
    return 'from-indigo-600 to-indigo-700 border-indigo-400/50'
  }

  return (
    <div 
      onClick={data.onClick}
      className={`px-5 py-3.5 shadow-xl bg-gradient-to-br ${getModuleColor()} rounded-xl min-w-[260px] w-[260px] ${data.onClick ? 'cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-2xl' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-400" />
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
            {data.moduleNumber ? (
              <span className="text-lg font-extrabold text-white">{data.moduleNumber}</span>
            ) : (
            <FolderOpen className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-white/80 uppercase tracking-wide mb-0.5">
              {data.moduleNumber ? `Module ${data.moduleNumber}` : 'Module'}
          </div>
            <div className="text-xs font-bold text-white leading-tight">{data.label}</div>
          </div>
        </div>
        {percentage === 100 && (
          <CheckCircle className="w-5 h-5 text-white flex-shrink-0 drop-shadow-lg" />
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2 mb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-white/90">Progress</span>
          <span className="text-xs font-bold text-white">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-[10px] text-white/80 mt-1">
          {completedCount}/{data.lessonCount} sections
        </div>
      </div>
    </div>
  )
}
