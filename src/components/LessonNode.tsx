'use client'

import { Handle, Position } from 'reactflow'
import { FileText, CheckCircle, Clock, Circle } from 'lucide-react'

interface LessonNodeProps {
  data: {
    label: string
    duration: string | number
    completed: boolean
    order?: number
    onClick: () => void
  }
}

export default function LessonNode({ data }: LessonNodeProps) {
  // Different styling for completed vs not completed
  const cardStyle = data.completed
    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 hover:border-green-600 hover:shadow-green-200/50'
    : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-blue-200/50'

  return (
    <div 
      onClick={data.onClick}
      className={`px-4 py-2.5 shadow-lg rounded-lg min-w-[240px] w-[240px] cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] ${cardStyle}`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-blue-500" />
      
      <div className="flex items-start gap-2">
        {/* Order Number Badge */}
        {data.order && (
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            data.completed 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {data.order}
          </div>
        )}
        
        {/* Status Icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          data.completed 
            ? 'bg-green-500 shadow-md' 
            : 'bg-gray-100'
        }`}>
            {data.completed ? (
            <CheckCircle className="w-4 h-4 text-white" />
            ) : (
            <Circle className="w-4 h-4 text-gray-400" />
            )}
          </div>
        
        {/* Content */}
          <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold leading-tight mb-1 ${
            data.completed ? 'text-green-900' : 'text-gray-900'
          }`}>
            {data.label}
            </div>
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3 h-3 ${data.completed ? 'text-green-600' : 'text-gray-500'}`} />
            <span className={`text-[10px] font-medium ${data.completed ? 'text-green-700' : 'text-gray-600'}`}>
              {data.duration} min
            </span>
            {data.completed && (
              <span className="ml-auto text-[9px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
