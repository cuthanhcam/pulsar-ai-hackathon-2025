/**
 * 🔓 CORS Middleware
 * Allow requests from frontend
 */

import cors from 'cors'
import { env } from '../config/env'

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Parse allowed origins from env (comma-separated)
    const allowedOrigins = env.ALLOWED_ORIGINS 
      ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [env.FRONTEND_URL]
    
    // Allow requests from allowed origins or no origin (e.g., Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: env.CORS_MAX_AGE,
})

