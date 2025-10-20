#!/usr/bin/env node

/**
 * 🔐 Generate Secure NEXTAUTH_SECRET
 * 
 * This script generates a cryptographically secure random string
 * for use as NEXTAUTH_SECRET in your .env file
 * 
 * Usage:
 *   node scripts/generate-secret.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

console.log('🔐 Generating Secure NEXTAUTH_SECRET...\n')

// Generate 32 bytes of random data and encode as base64
const secret = crypto.randomBytes(32).toString('base64')

console.log('✅ Secret generated successfully!\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`📋 Copy this to your .env file:`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log(`NEXTAUTH_SECRET=${secret}\n`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('⚠️  .env file not found. Creating one from template...\n')
  
  const templatePath = path.join(process.cwd(), 'env.template')
  if (fs.existsSync(templatePath)) {
    let envContent = fs.readFileSync(templatePath, 'utf8')
    envContent = envContent.replace(
      'NEXTAUTH_SECRET=CHANGE_THIS_TO_A_RANDOM_32_CHARACTER_STRING_IN_PRODUCTION',
      `NEXTAUTH_SECRET=${secret}`
    )
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env file created with new secret!\n')
  } else {
    console.log('❌ env.template not found. Please create .env manually.\n')
  }
} else {
  console.log('📝 Instructions:')
  console.log('   1. Open your .env file')
  console.log('   2. Find the line: NEXTAUTH_SECRET=...')
  console.log('   3. Replace it with the secret above')
  console.log('   4. Save and restart your server\n')
}

console.log('🔒 Security Tips:')
console.log('   • Never commit .env to git')
console.log('   • Use different secrets for dev/staging/production')
console.log('   • Rotate secrets every 90 days')
console.log('   • Keep secrets in a secure password manager')
console.log('   • Use environment variables in CI/CD pipelines\n')

console.log('📚 More info: https://next-auth.js.org/configuration/options#secret\n')

