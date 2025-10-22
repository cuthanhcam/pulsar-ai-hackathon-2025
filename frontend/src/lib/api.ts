/**
 * 📡 API Client for Backend Communication
 * Axios-based HTTP client với authentication
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/**
 * Create axios instance with default config
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * API wrapper với typed responses
 */
export const api = {
  // ==================== Auth ====================
  auth: {
    register: (data: { email: string; password: string; name?: string; phone?: string }) => 
      apiClient.post('/auth/register', data),
    
    login: (data: { email: string; password: string }) => 
      apiClient.post('/auth/login', data),
    
    verifyPassword: (password: string) => 
      apiClient.post('/auth/verify-password', { password }),
    
    me: () => 
      apiClient.get('/auth/me'),
  },

  // ==================== Lessons ====================
  lessons: {
    getAll: () => 
      apiClient.get('/lessons'),
    
    getOne: (id: string) => 
      apiClient.get(`/lessons/${id}`),
    
    generate: (data: { 
      topic: string
      difficulty?: string
      duration?: number
      preferences?: any 
    }) => 
      apiClient.post('/lessons/generate', data),
    
    clone: (lessonId: string) => 
      apiClient.post('/lessons/clone', { lessonId }),
    
    delete: (id: string) => 
      apiClient.delete(`/lessons/${id}/delete`),
  },

  // ==================== Sections ====================
  sections: {
    getContent: (id: string) => 
      apiClient.post(`/sections/${id}`),
    
    complete: (id: string) => 
      apiClient.post(`/sections/${id}/complete`),
  },

  // ==================== Chat ====================
  chat: {
    send: (data: { 
      message: string
      lessonId?: string
      chatHistory?: Array<{ role: string; content: string }> 
    }) => 
      apiClient.post('/chat', data),
  },

  // ==================== Quiz ====================
  quiz: {
    generate: (data: { 
      sectionId: string
      sectionTitle: string
      moduleTitle: string 
    }) => 
      apiClient.post('/quiz/generate', data),
    
    submit: (data: any) => 
      apiClient.post('/quiz/submit', data),
  },

  // ==================== User ====================
  user: {
    getProfile: () => 
      apiClient.get('/user/profile'),
    
    updateProfile: (data: { 
      name?: string
      phone?: string
      currentPassword?: string
      newPassword?: string 
    }) => 
      apiClient.post('/user/update-profile', data),
    
    updateApiKey: (apiKey: string) => 
      apiClient.post('/user/update-api-key', { apiKey }),
    
    getApiKey: () => 
      apiClient.get('/user/get-api-key'),
    
    getCredits: () => 
      apiClient.get('/user/credits'),
  },
}

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred'
  }
  return 'An unexpected error occurred'
}

/**
 * Auth helpers
 */
export const authHelpers = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!authHelpers.getToken()
  },
}

export default apiClient

