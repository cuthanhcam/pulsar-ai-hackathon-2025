/**
 * 🔒 Encryption utilities for sensitive data like API keys
 * Uses Node.js crypto module (AES-256-GCM)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { env } from '../config/env'

/**
 * Encrypt a string (e.g., API key) using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData (all hex)
 */
export function encrypt(text: string): string {
  const ENCRYPTION_KEY = env.ENCRYPTION_KEY
  
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    console.warn('⚠️ Encryption key not available, storing plain text')
    return text
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    const iv = randomBytes(16) // 16 bytes IV
    const cipher = createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('❌ Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText - Encrypted string in format: iv:authTag:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  const ENCRYPTION_KEY = env.ENCRYPTION_KEY
  
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    console.warn('⚠️ Encryption key not available, returning as-is')
    return encryptedText
  }

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      // Not in encrypted format, return as-is (backward compatibility)
      console.warn('⚠️ Data not in encrypted format, returning as-is')
      return encryptedText
    }

    const [ivHex, authTagHex, encrypted] = parts
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('❌ Decryption error:', error)
    // Return as-is for backward compatibility
    return encryptedText
  }
}

/**
 * Check if a string is encrypted
 */
export function isEncrypted(text: string): boolean {
  return text.split(':').length === 3
}

