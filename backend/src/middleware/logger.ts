/**
 * 📝 Request Logger Middleware
 */

import { Request, Response, NextFunction } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const statusCode = res.statusCode
    const statusColor = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢'
    
    console.log(
      `${statusColor} ${req.method} ${req.path} - ${statusCode} - ${duration}ms`
    )
  })
  
  next()
}

