import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Initialize Gemini AI client with API key from environment
 * This file should ONLY be imported in server-side code (API routes, server components)
 * to prevent API key exposure to the client
 */

// Get API key from environment (server-side only)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

// Initialize Gemini client
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')

// Model configurations - Using latest models
export const GEMINI_MODEL_PRIMARY = 'gemini-2.5-flash'
export const GEMINI_MODEL_FALLBACK = 'gemini-2.5-flash'

/**
 * Get a Gemini model instance
 * @param modelName - Model name (default: gemini-2.0-flash-exp)
 * @returns Generative model instance
 */
export function getGeminiModel(modelName: string = GEMINI_MODEL_PRIMARY) {
  return genAI.getGenerativeModel({ model: modelName })
}

/**
 * Get a Gemini model with fallback
 * Tries primary model first, falls back to secondary if it fails
 * @param apiKey - Gemini API key
 * @returns Model instance or throws error
 */
export async function getGeminiModelWithFallback(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // Try primary model first
  try {
    const primaryModel = genAI.getGenerativeModel({ model: GEMINI_MODEL_PRIMARY })
    // Test if model is accessible with a simple prompt
    await primaryModel.generateContent('test')
    console.log(`[Gemini] Using primary model: ${GEMINI_MODEL_PRIMARY}`)
    return { model: primaryModel, modelName: GEMINI_MODEL_PRIMARY }
  } catch (primaryError) {
    console.log(`[Gemini] Primary model failed: ${GEMINI_MODEL_PRIMARY}`, primaryError)
    
    // Fallback to secondary model
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: GEMINI_MODEL_FALLBACK })
      console.log(`[Gemini] Using fallback model: ${GEMINI_MODEL_FALLBACK}`)
      return { model: fallbackModel, modelName: GEMINI_MODEL_FALLBACK }
    } catch (fallbackError) {
      console.error(`[Gemini] Both models failed`)
      throw new Error(`Both Gemini models failed. Primary: ${primaryError}, Fallback: ${fallbackError}`)
    }
  }
}

/**
 * Generate content with Gemini AI
 * @param prompt - The prompt to generate content from
 * @param modelName - Model name (optional)
 * @returns Generated text content
 */
export async function generateContent(
  prompt: string,
  modelName?: string
): Promise<string> {
  const model = getGeminiModel(modelName)
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

/**
 * Generate content with streaming
 * @param prompt - The prompt to generate content from
 * @param modelName - Model name (optional)
 * @returns Async generator that yields text chunks
 */
export async function* streamGenerateContent(
  prompt: string,
  modelName?: string
): AsyncGenerator<string, void, unknown> {
  const model = getGeminiModel(modelName)
  const result = await model.generateContentStream(prompt)

  for await (const chunk of result.stream) {
    const chunkText = chunk.text()
    yield chunkText
  }
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 * @param text - Raw text response from Gemini
 * @returns Parsed JSON object
 */
export function parseJSONResponse<T = any>(text: string): T {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = 
    text.match(/```json\n([\s\S]*?)\n```/) || 
    text.match(/```\n([\s\S]*?)\n```/)
  
  const jsonText = jsonMatch ? jsonMatch[1] : text
  return JSON.parse(jsonText)
}

/**
 * Constants for credit costs
 */
export const CREDITS = {
  COURSE: parseInt(process.env.CREDITS_PER_COURSE || '30'),
  QUIZ: parseInt(process.env.CREDITS_PER_QUIZ || '10'),
  CHAT: parseInt(process.env.CREDITS_PER_CHAT || '5'),
  MINDMAP: 10,
  DEFAULT_USER: parseInt(process.env.DEFAULT_USER_CREDITS || '500'),
} as const
