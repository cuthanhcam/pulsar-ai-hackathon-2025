import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('[Admin Auth] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userEmail: session?.user?.email
    })
    
    // Check if session exists and has user data
    if (!session || !session.user || !session.user.id) {
      console.log('[Admin Auth] No valid session')
      return { 
        authorized: false, 
        error: 'Unauthorized - Please login',
        status: 401 
      }
    }

    // Store user ID safely
    const userId = session.user.id
    
    // Check if user has admin role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    console.log('[Admin Auth] User found:', {
      userExists: !!user,
      userRole: user?.role
    })

    if (!user) {
      console.log('[Admin Auth] User not found in database')
      return { 
        authorized: false, 
        error: 'User not found',
        status: 404 
      }
    }

    if (user.role !== 'admin') {
      console.log('[Admin Auth] User is not admin:', user.role)
      return { 
        authorized: false, 
        error: 'Access denied. Admin role required.',
        status: 403 
      }
    }

    console.log('[Admin Auth] Access granted')
    return { 
      authorized: true, 
      userId: userId 
    }
  } catch (error) {
    console.error('Admin auth check error:', error)
    return { 
      authorized: false, 
      error: 'Authentication error',
      status: 500 
    }
  }
}

export async function withAdminAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const authCheck = await checkAdminAuth()
    
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error },
        { status: authCheck.status }
      )
    }

    return handler(req, context)
  }
}

