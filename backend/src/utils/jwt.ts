/**
 * 🔐 JWT Utilities
 */

import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

/**
 * Generate JWT token
 * @param payload - User data to encode
 * @param expiresIn - Token expiration time (default: from env)
 * @returns JWT token
 */
export function generateToken(payload: JWTPayload, expiresIn?: string): string {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: expiresIn || env.JWT_EXPIRES_IN 
  })
}

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Generate refresh token (longer expiration)
 * @param payload - User data to encode
 * @param expiresIn - Token expiration time (default: from env)
 * @returns Refresh token
 */
export function generateRefreshToken(payload: JWTPayload, expiresIn?: string): string {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: expiresIn || env.JWT_REFRESH_EXPIRES_IN 
  })
}

