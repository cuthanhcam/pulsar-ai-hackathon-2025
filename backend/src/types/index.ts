/**
 * 📝 Type Definitions
 */

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  credits: number
  geminiApiKey?: string
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id: string
  userId: string
  title: string
  description?: string
  topic: string
  difficulty: string
  duration: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Module {
  id: string
  lessonId: string
  title: string
  description?: string
  order: number
  completed: boolean
  createdAt: Date
}

export interface Section {
  id: string
  moduleId: string
  title: string
  content: string
  order: number
  duration: number
  completed: boolean
  isGenerating: boolean
  createdAt: Date
}

export interface QuizQuestion {
  id: string
  quizId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  order: number
}

export interface ChatMessage {
  id: string
  userId: string
  lessonId?: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

