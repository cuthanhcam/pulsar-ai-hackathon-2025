#!/usr/bin/env node

/**
 * 🔐 Generate a secure encryption key for Node.js crypto (AES-256-GCM)
 * 
 * Usage:
 *   node scripts/generate-encryption-key.js
 * 
 * This will generate a 32-byte (256-bit) hex string (64 characters) suitable for ENCRYPTION_KEY
 */

const crypto = require('crypto')

// Generate a 32-byte (256-bit) random key
const keyBytes = crypto.randomBytes(32)
const keyHex = keyBytes.toString('hex') // 64-char hex string

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔐 ENCRYPTION KEY GENERATED (Node.js Crypto - AES-256-GCM)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('Add this to your .env file:')
console.log('')
console.log(`ENCRYPTION_KEY=${keyHex}`)
console.log('')
console.log(`Length: ${keyHex.length} characters (must be exactly 64)`)
console.log('')
console.log('For Vercel deployment, add it to Environment Variables:')
console.log('1. Go to your Vercel project settings')
console.log('2. Navigate to "Environment Variables"')
console.log('3. Add: ENCRYPTION_KEY = (paste the value above)')
console.log('4. Apply to: Production, Preview, Development')
console.log('')
console.log('⚠️  IMPORTANT: Keep this key secret and never commit it to git!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
