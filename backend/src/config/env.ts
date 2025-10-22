/**
 * 🔧 Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv'
import { z } from 'zod'

// Load .env file
dotenv.config()

// Define environment schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  BODY_SIZE_LIMIT: z.string().default('10mb'),
  API_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  
  // JWT & Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  ENCRYPTION_KEY: z.string().length(64),
  
  // Gemini AI
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_TEMPERATURE: z.string().transform(Number).default('0.7'),
  
  // Frontend & CORS
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),
  CORS_MAX_AGE: z.string().transform(Number).default('86400'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().default('PulsarTeam AI'),
  SMTP_FROM_EMAIL: z.string().optional(),
  
  // Qdrant
  QDRANT_URL: z.string().optional(),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default('pulsar_embeddings'),
  
  // Ollama
  OLLAMA_URL: z.string().optional(),
  OLLAMA_MODEL: z.string().default('llama2'),
  
  // Embedding
  EMBED_URL: z.string().optional(),
  EMBED_TYPE: z.string().optional(),
  EMBED_MODEL: z.string().default('mxbai-embed-large-v1'),
  
  // Credit System
  DEFAULT_CREDITS: z.string().transform(Number).default('500'),
  CREDIT_COST_COURSE_GENERATE: z.string().transform(Number).default('100'),
  CREDIT_COST_QUIZ_GENERATE: z.string().transform(Number).default('5'),
  CREDIT_COST_CHAT_MESSAGE: z.string().transform(Number).default('1'),
  CREDIT_COST_SECTION_GENERATE: z.string().transform(Number).default('10'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  
  // OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_REQUEST_LOGGING: z.string().transform((v) => v === 'true').default('true'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('5mb'),
  ALLOWED_FILE_TYPES: z.string().optional(),
  
  // Session
  SESSION_COOKIE_NAME: z.string().default('pulsar_session'),
  SESSION_MAX_AGE: z.string().transform(Number).default('604800000'),
  
  // Admin
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  
  // Development
  DEBUG: z.string().transform((v) => v === 'true').default('false'),
  PRISMA_QUERY_LOG: z.string().transform((v) => v === 'true').default('false'),
  
  // Production
  API_VERSION: z.string().default('v1'),
  FORCE_HTTPS: z.string().transform((v) => v === 'true').default('false'),
  TRUST_PROXY: z.string().transform((v) => v === 'true').default('false'),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

export const env = parseEnv()

// Type export for TypeScript
export type Env = z.infer<typeof envSchema>

