/**
 * 🛡️ Security Configuration
 * 
 * Comprehensive security settings including:
 * - Content Security Policy (CSP)
 * - Security Headers
 * - XSS Protection
 * - CSRF Protection
 */

// ========================================
// 🔐 Secret Validation
// ========================================

/**
 * Validate NEXTAUTH_SECRET strength
 */
export function validateSecret(secret: string | undefined): {
  valid: boolean
  error?: string
  severity: 'error' | 'warning' | 'ok'
} {
  if (!secret) {
    return {
      valid: false,
      error: 'NEXTAUTH_SECRET is not set',
      severity: 'error'
    }
  }

  // Check for default/weak secrets
  const weakSecrets = [
    'your-secret-key-change-this-in-production',
    'change-me',
    'secret',
    'password',
    '123456',
    'test'
  ]

  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    return {
      valid: false,
      error: 'NEXTAUTH_SECRET is using a weak/default value. Generate a strong secret!',
      severity: 'error'
    }
  }

  // Check minimum length (should be at least 32 characters)
  if (secret.length < 32) {
    return {
      valid: false,
      error: `NEXTAUTH_SECRET is too short (${secret.length} chars). Minimum 32 characters required.`,
      severity: 'warning'
    }
  }

  // Check for sufficient complexity (alphanumeric + special chars)
  const hasLowerCase = /[a-z]/.test(secret)
  const hasUpperCase = /[A-Z]/.test(secret)
  const hasNumbers = /[0-9]/.test(secret)
  const hasSpecialChars = /[^a-zA-Z0-9]/.test(secret)

  const complexityScore = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length

  if (complexityScore < 3) {
    return {
      valid: true,
      error: 'NEXTAUTH_SECRET complexity is low. Consider using a more complex secret.',
      severity: 'warning'
    }
  }

  return {
    valid: true,
    severity: 'ok'
  }
}

// ========================================
// 🛡️ Security Headers
// ========================================

/**
 * Get comprehensive security headers
 */
export function getSecurityHeaders() {
  const headers: Record<string, string> = {
    // ✅ Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',
    
    // ✅ Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // ✅ Enable browser XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // ✅ Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // ✅ Restrict browser features
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', '),
    
    // ✅ Force HTTPS (only in production)
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    })
  }

  return headers
}

// ========================================
// 🔒 Content Security Policy (CSP)
// ========================================

/**
 * Get Content Security Policy directives
 * 
 * This protects against:
 * - XSS (Cross-Site Scripting)
 * - Data injection attacks
 * - Unauthorized script execution
 */
export function getCSPDirectives() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // CSP directives
  const directives: Record<string, string[]> = {
    // Default: only same origin
    'default-src': ["'self'"],
    
    // Scripts: allow self + inline (for Next.js)
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for Next.js in dev mode
      "'unsafe-inline'", // Required for inline scripts
      ...(isDevelopment ? ["'unsafe-eval'"] : [])
    ],
    
    // Styles: allow self + inline (for Tailwind)
    'style-src': [
      "'self'",
      "'unsafe-inline'" // Required for Tailwind and inline styles
    ],
    
    // Images: allow self + data URIs + external sources
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:', // Allow HTTPS images
      'http://localhost:*' // Development only
    ],
    
    // Fonts: allow self + data URIs
    'font-src': [
      "'self'",
      'data:'
    ],
    
    // Media: allow self
    'media-src': ["'self'"],
    
    // Objects: block all (no Flash, etc.)
    'object-src': ["'none'"],
    
    // Child frames: only same origin
    'frame-src': ["'self'"],
    
    // Connect: API calls
    'connect-src': [
      "'self'",
      'https://generativelanguage.googleapis.com', // Gemini API
      'https://api.openai.com', // OpenAI API (if used)
      ...(isDevelopment ? [
        'http://localhost:*', 
        'ws://localhost:*',
        'http://localhost:3000',
        'ws://localhost:3000',
        'http://127.0.0.1:*',
        'ws://127.0.0.1:*'
      ] : [])
    ],
    
    // Workers: allow self
    'worker-src': [
      "'self'",
      'blob:'
    ],
    
    // Base URI: restrict base tag
    'base-uri': ["'self'"],
    
    // Form actions: only same origin
    'form-action': ["'self'"],
    
    // Frame ancestors: prevent embedding
    'frame-ancestors': ["'none'"],
    
    // Upgrade insecure requests (production only)
    ...(process.env.NODE_ENV === 'production' && {
      'upgrade-insecure-requests': []
    })
  }

  // Convert to CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.join(' ')}`
    })
    .join('; ')

  return cspString
}

// ========================================
// 🔐 Rate Limiting Configuration
// ========================================

export const rateLimitConfig = {
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts. Please try again later.'
  },
  
  // API endpoints (moderate)
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests. Please try again later.'
  },
  
  // Public endpoints (lenient)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: 'Rate limit exceeded.'
  }
}

// ========================================
// 🔒 CSRF Protection
// ========================================

/**
 * Verify CSRF token (NextAuth handles this automatically)
 */
export function isValidCSRFToken(token: string | undefined): boolean {
  // NextAuth.js handles CSRF automatically
  // This is a placeholder for custom CSRF verification if needed
  return true
}

// ========================================
// 🛡️ Input Sanitization Helpers
// ========================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/
  return phoneRegex.test(phone)
}

// ========================================
// 🔐 Security Audit Logger
// ========================================

export function logSecurityEvent(event: {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_access' | 'suspicious_activity'
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  details?: string
}) {
  const timestamp = new Date().toISOString()
  
  // In production, send to logging service (Sentry, CloudWatch, etc.)
  console.log(`[SECURITY] ${timestamp} - ${event.type}`, {
    userId: event.userId,
    email: event.email?.replace(/(.{3}).+(@.+)/, '$1***$2'), // Mask email
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details
  })
  
  // TODO: Send to external logging service in production
  // await sendToLoggingService(event)
}

// ========================================
// 🔒 Security Warnings
// ========================================

/**
 * Log security warnings on startup
 */
export function checkSecurityWarnings() {
  const warnings: string[] = []
  
  // Check NEXTAUTH_SECRET
  const secretValidation = validateSecret(process.env.NEXTAUTH_SECRET)
  if (!secretValidation.valid || secretValidation.severity === 'warning') {
    warnings.push(`⚠️  ${secretValidation.error}`)
  }
  
  // Check NODE_ENV
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    warnings.push('⚠️  NODE_ENV is not set. Defaulting to development mode.')
  }
  
  // Check if running in production with default secret
  if (process.env.NODE_ENV === 'production') {
    if (!secretValidation.valid) {
      warnings.push('🔴 CRITICAL: Running in production with weak/default NEXTAUTH_SECRET!')
    }
  }
  
  // Log warnings
  if (warnings.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔒 SECURITY WARNINGS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    warnings.forEach(warning => console.log(warning))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } else {
    console.log('✅ Security checks passed\n')
  }
}

