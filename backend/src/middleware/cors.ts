/**
 * 🔓 CORS Middleware
 * Allow requests from frontend
 */

import cors from 'cors'
import { env } from '../config/env'

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests from frontend or no origin (e.g., Postman)
    const allowedOrigins = [
      env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
})

