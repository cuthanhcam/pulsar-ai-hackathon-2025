export interface Lesson {
  id: string
  title: string
  content: string
  duration: string | number
  completed: boolean
  order?: number
}

export interface Section {
  id: string
  title: string
  content: string
  duration: string | number
  completed: boolean
  order?: number
}

export interface Module {
  id: string
  title: string
  description: string
  lessons?: Lesson[]
  sections?: Section[]
  completed: boolean
  order?: number
}

export interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
  totalLessons: number
  completedLessons: number
  createdAt: string
}
