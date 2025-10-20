#!/usr/bin/env node

/**
 * 🔒 Security Audit Script
 * 
 * Checks for common security issues in the project
 */

const fs = require('fs')
const path = require('path')

console.log('🔒 Running Security Audit...\n')

let issuesFound = 0
let warningsFound = 0

// ========================================
// Check 1: .env file existence and .gitignore
// ========================================
console.log('📋 Checking environment files...')

const envPath = path.join(process.cwd(), '.env')
const gitignorePath = path.join(process.cwd(), '.gitignore')

if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found')
  
  // Check if .env is in .gitignore
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
    if (gitignoreContent.includes('.env') || gitignoreContent.includes('*.env')) {
      console.log('   ✅ .env is in .gitignore')
    } else {
      console.log('   🔴 ERROR: .env is NOT in .gitignore!')
      console.log('      This could expose secrets in version control.')
      issuesFound++
    }
  } else {
    console.log('   ⚠️  WARNING: .gitignore not found')
    warningsFound++
  }
} else {
  console.log('   ⚠️  WARNING: .env file not found')
  console.log('      Create one from env.template')
  warningsFound++
}

// ========================================
// Check 2: NEXTAUTH_SECRET validation
// ========================================
console.log('\n🔐 Checking NEXTAUTH_SECRET...')

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const secretMatch = envContent.match(/NEXTAUTH_SECRET=(.+)/)
  
  if (secretMatch) {
    const secret = secretMatch[1].trim()
    
    // Check for default/weak secrets
    const weakSecrets = [
      'CHANGE_THIS',
      'change-this',
      'your-secret',
      'secret',
      'password',
      '123456',
      'test'
    ]
    
    const isWeak = weakSecrets.some(weak => 
      secret.toLowerCase().includes(weak.toLowerCase())
    )
    
    if (isWeak) {
      console.log('   🔴 ERROR: NEXTAUTH_SECRET is using a weak/default value!')
      console.log('      Run: node scripts/generate-secret.js')
      issuesFound++
    } else if (secret.length < 32) {
      console.log(`   ⚠️  WARNING: NEXTAUTH_SECRET is too short (${secret.length} chars)`)
      console.log('      Recommended: at least 32 characters')
      warningsFound++
    } else {
      console.log('   ✅ NEXTAUTH_SECRET looks secure')
    }
  } else {
    console.log('   🔴 ERROR: NEXTAUTH_SECRET not found in .env')
    issuesFound++
  }
}

// ========================================
// Check 3: Database file security
// ========================================
console.log('\n🗄️  Checking database security...')

const dbPath = path.join(process.cwd(), 'dev.db')
if (fs.existsSync(dbPath)) {
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
    if (gitignoreContent.includes('*.db') || gitignoreContent.includes('dev.db')) {
      console.log('   ✅ Database files are in .gitignore')
    } else {
      console.log('   🔴 ERROR: Database files NOT in .gitignore!')
      console.log('      Add "*.db" to .gitignore')
      issuesFound++
    }
  }
}

// ========================================
// Check 4: Dependencies vulnerabilities
// ========================================
console.log('\n📦 Checking dependencies...')
console.log('   ℹ️  Run "npm audit" to check for known vulnerabilities')

// ========================================
// Check 5: Security headers configuration
// ========================================
console.log('\n🛡️  Checking security headers...')

const securityLibPath = path.join(process.cwd(), 'src', 'lib', 'security.ts')
if (fs.existsSync(securityLibPath)) {
  console.log('   ✅ Security library found')
} else {
  console.log('   ⚠️  WARNING: Security library not found')
  warningsFound++
}

const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts')
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
  if (middlewareContent.includes('Content-Security-Policy')) {
    console.log('   ✅ CSP (Content Security Policy) is configured')
  } else {
    console.log('   ⚠️  WARNING: CSP not found in middleware')
    warningsFound++
  }
}

// ========================================
// Check 6: Sensitive files in git
// ========================================
console.log('\n📁 Checking for sensitive files...')

const sensitiveFiles = [
  '.env',
  '.env.local',
  '.env.production',
  'dev.db',
  'dev.db-journal'
]

if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  
  sensitiveFiles.forEach(file => {
    if (gitignoreContent.includes(file) || gitignoreContent.includes('*.env')) {
      // OK
    } else if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`   ⚠️  WARNING: ${file} exists but may not be in .gitignore`)
      warningsFound++
    }
  })
}

// ========================================
// Summary
// ========================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 SECURITY AUDIT SUMMARY')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`   🔴 Critical Issues: ${issuesFound}`)
console.log(`   ⚠️  Warnings: ${warningsFound}`)

if (issuesFound === 0 && warningsFound === 0) {
  console.log('\n   ✅ All security checks passed!')
} else if (issuesFound === 0) {
  console.log('\n   🟡 Security checks completed with warnings')
  console.log('      Review warnings and fix when possible')
} else {
  console.log('\n   🔴 Security issues found!')
  console.log('      Please fix critical issues before deploying')
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Exit with error code if critical issues found
process.exit(issuesFound > 0 ? 1 : 0)

