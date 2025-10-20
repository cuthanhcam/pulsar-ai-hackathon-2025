import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSecurityHeaders, getCSPDirectives } from "@/lib/security"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // 🛡️ Apply security headers to ALL responses
  let response: NextResponse
  
  // Skip admin auth check for API routes (they have their own auth)
  const isApiRoute = pathname.startsWith('/api')
  const isAdminPath = pathname.startsWith('/admin')
  const isAdminLoginPath = pathname === '/admin/login'
  
  // Handle admin routes with authentication
  if (isAdminPath && !isAdminLoginPath && !isApiRoute) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'dev-secret-DO-NOT-USE-IN-PRODUCTION'
    })
    
    if (!token) {
      // Not authenticated - redirect to admin login
      response = NextResponse.redirect(new URL('/admin/login', req.url))
    } else if (token.role !== 'admin') {
      // Authenticated but not admin - redirect to admin login
      response = NextResponse.redirect(new URL('/admin/login', req.url))
    } else {
      // Admin authenticated - allow access
      response = NextResponse.next()
    }
  }
  // If accessing admin login and already admin, redirect to dashboard
  else if (isAdminLoginPath && !isApiRoute) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'dev-secret-DO-NOT-USE-IN-PRODUCTION'
    })
    
    if (token?.role === 'admin') {
      response = NextResponse.redirect(new URL('/admin', req.url))
    } else {
      response = NextResponse.next()
    }
  }
  // All other routes (including API routes) - just pass through
  else {
    response = NextResponse.next()
  }
  
  // 🛡️ Add comprehensive security headers to ALL responses
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // 🔒 Add Content Security Policy
  const csp = getCSPDirectives()
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}

// 🛡️ Apply security headers to ALL routes
export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|icon.png).*)'
  ]
}
