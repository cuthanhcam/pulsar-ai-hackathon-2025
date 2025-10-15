'use client'

import { Handle, Position } from 'reactflow'
import { GraduationCap } from 'lucide-react'

interface CourseNodeProps {
  data: {
    label: string
    description: string
  }
}

export default function CourseNode({ data }: CourseNodeProps) {
  return (
    <div className="px-6 py-4 shadow-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 border-4 border-blue-400/50 rounded-2xl min-w-[320px] max-w-[320px] relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 !bg-blue-400 shadow-lg" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">
              🎓 Learning Path
            </div>
            <div className="text-lg font-extrabold text-white leading-tight">
              {data.label}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-blue-100 leading-relaxed">{data.description}</p>
      </div>
    </div>
  )
}
