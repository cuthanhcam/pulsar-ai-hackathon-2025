/**
 * 🔥 Global Error Handler
 */

import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  details?: any
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  console.error('❌ Error:', {
    message,
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
  
  res.status(statusCode).json({
    error: message,
    details: err.details,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// Create custom error
export const createError = (statusCode: number, message: string, details?: any): ApiError => {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.details = details
  return error
}

