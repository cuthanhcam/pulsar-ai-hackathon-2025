'use client'

import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import CourseNode from './CourseNode'
import ModuleNode from './ModuleNode'
import LessonNode from './LessonNode'
import { Course } from '@/types/course'

// Define nodeTypes outside component to prevent re-creation
const nodeTypes = {
  courseNode: CourseNode,
  moduleNode: ModuleNode,
  lessonNode: LessonNode,
}

interface CourseVisualizationProps {
  course: Course
  onLessonClick?: (lessonId: string) => void
  onSectionClick?: (sectionId: string) => void
  onModuleClick?: (moduleId: string) => void
}

export default function CourseVisualization({ course, onLessonClick, onSectionClick, onModuleClick }: CourseVisualizationProps) {

  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    
    // Course node at CENTER (trung tâm của cả mindmap)
    const centerX = 400
    const courseWidth = 320 // width of course node
    nodes.push({
      id: 'course',
      type: 'courseNode',
      position: { x: centerX - (courseWidth / 2), y: 40 },
      data: {
        label: course.title,
        description: course.description,
      },
    })

    // Bố cục đối xứng: Module số lẻ BÊN TRÁI, Module số chẵn BÊN PHẢI
    const leftX = 30 // X cho modules 1, 3, 5, 7 (ngoài cùng bên trái)
    const rightX = centerX + 380 // X cho modules 2, 4, 6, 8 (ngoài cùng bên phải)
    let leftY = 280 // Y tracker riêng cho cột trái
    let rightY = 280 // Y tracker riêng cho cột phải
    const moduleSectionSpacing = 150 // Khoảng cách từ module đến section đầu tiên
    const sectionSpacing = 85 // Khoảng cách giữa các sections
    const moduleGroupSpacing = 50 // Khoảng cách giữa các nhóm module

    course.modules.forEach((module, moduleIndex) => {
      const moduleNumber = moduleIndex + 1
      const isOdd = moduleNumber % 2 === 1
      const moduleX = isOdd ? leftX : rightX // Module số lẻ bên TRÁI, số chẵn bên PHẢI
      
      // Support both lessons and sections for backward compatibility
      const items = (module as any).sections || (module as any).lessons || []
      
      // Calculate completion percentage
      const completedCount = items.filter((item: any) => item.completed).length
      const completionPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

      // Use separate Y for left and right columns
      const currentY = isOdd ? leftY : rightY

      // Position module node
      nodes.push({
        id: module.id,
        type: 'moduleNode',
        position: { x: moduleX, y: currentY },
        data: {
          label: module.title,
          description: module.description,
          completed: module.completed,
          lessonCount: items.length,
          completedCount: completedCount,
          completionPercentage: completionPercentage,
          moduleNumber: moduleNumber,
          onClick: onModuleClick ? () => onModuleClick(module.id) : undefined,
        },
      })

      // Move Y position down for sections
      let sectionY = currentY + moduleSectionSpacing

      // Position sections vertically under module
      items.forEach((item: any, itemIndex: number) => {
        nodes.push({
          id: item.id,
          type: 'lessonNode',
          position: { x: moduleX, y: sectionY },
          data: {
            label: item.title,
            duration: item.duration || 10,
            completed: item.completed || false,
            order: itemIndex + 1,
            onClick: () => {
              // Call section click if available, otherwise lesson click
              if (onSectionClick) {
                onSectionClick(item.id)
              } else if (onLessonClick) {
                onLessonClick(item.id)
              }
            },
          },
        })
        
        sectionY += sectionSpacing
      })

      // Update Y for the respective column (left or right)
      if (isOdd) {
        leftY = sectionY + moduleGroupSpacing
      } else {
        rightY = sectionY + moduleGroupSpacing
      }
    })

    return nodes
  }, [course, onLessonClick, onSectionClick, onModuleClick])

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []

    course.modules.forEach((module) => {
      // 1. Connect Course → Module (màu hồng animated)
      edges.push({
        id: `course-${module.id}`,
        source: 'course',
        target: module.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#ec4899', strokeWidth: 2.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ec4899',
        },
      })

      const items = (module as any).sections || (module as any).lessons || []
      
      // 2. Connect Module → Each Section (màu xanh nếu completed, xám nếu chưa)
      items.forEach((item: any) => {
        const isCompleted = item.completed || false
        const edgeColor = isCompleted ? '#22c55e' : '#94a3b8'
        const strokeWidth = isCompleted ? 2.5 : 2
        
        edges.push({
          id: `${module.id}-${item.id}`,
          source: module.id,
          target: item.id,
          type: 'smoothstep',
          animated: isCompleted,
          style: { 
            stroke: edgeColor, 
            strokeWidth: strokeWidth,
            strokeDasharray: isCompleted ? '0' : '5 5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
        })
      })
    })

    return edges
  }, [course])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 0.85 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        className="bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl"
      >
        <Background 
          color="#94a3b8" 
          gap={24} 
          size={1} 
          style={{ opacity: 0.3 }} 
        />
        <Controls 
          className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-lg shadow-lg"
          maskColor="rgba(0, 0, 0, 0.05)"
          nodeColor={(node) => {
            if (node.type === 'courseNode') return '#3b82f6'
            if (node.type === 'moduleNode') {
              // Color based on completion
              const data = node.data as any
              if (data?.completionPercentage === 100) return '#22c55e'
              if (data?.completionPercentage >= 50) return '#3b82f6'
              return '#6366f1'
            }
            // Lesson nodes
            const data = node.data as any
            return data?.completed ? '#22c55e' : '#94a3b8'
          }}
        />
      </ReactFlow>
    </div>
  )
}
