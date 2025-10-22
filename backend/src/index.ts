/**
 * 🚀 PulsarTeam Backend API Server
 * Express.js + TypeScript + Prisma
 */

import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'
import { env } from './config/env'
import { prisma } from './config/database'

// Import routes
import authRoutes from './routes/auth.routes'
import lessonsRoutes from './routes/lessons.routes'
import sectionsRoutes from './routes/sections.routes'
import chatRoutes from './routes/chat.routes'
import quizRoutes from './routes/quiz.routes'
import userRoutes from './routes/user.routes'
import adminRoutes from './routes/admin.routes'

const app: Express = express()
const PORT = env.PORT || 5000

// ========================================
// 🛡️ Security & Middleware
// ========================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS
app.use(corsMiddleware)

// Body parsing
app.use(express.json({ limit: env.BODY_SIZE_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: env.BODY_SIZE_LIMIT }))

// Request logging
app.use(requestLogger)

// ========================================
// 🏥 Health Check
// ========================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: 'connected'
  })
})

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 PulsarTeam API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  })
})

// ========================================
// 📡 API Routes
// ========================================

app.use('/api/auth', authRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/sections', sectionsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

// ========================================
// ❌ 404 Handler
// ========================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString()
  })
})

// ========================================
// 🔥 Error Handler
// ========================================

app.use(errorHandler)

// ========================================
// 🚀 Server Startup
// ========================================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')

    // Start server
    app.listen(PORT, () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 PulsarTeam Backend API Server')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📡 Server running on: http://localhost:${PORT}`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
      console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()

export default app

