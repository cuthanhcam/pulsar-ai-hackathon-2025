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
  
  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  
  // JWT & Security
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64),
  
  // Gemini AI
  GEMINI_API_KEY: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  
  // Qdrant
  QDRANT_URL: z.string().optional(),
  
  // Ollama
  OLLAMA_URL: z.string().optional(),
  OLLAMA_MODEL: z.string().optional(),
  
  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),
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

