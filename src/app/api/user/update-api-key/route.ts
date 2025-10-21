import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  console.log('[UPDATE-API-KEY] === Request started ===')
  
  try {
    // 1. Check session
    const session = await getServerSession(authOptions)
    console.log('[UPDATE-API-KEY] Session:', session?.user?.email || 'No session')
    
    if (!session?.user?.id) {
      console.log('[UPDATE-API-KEY] ❌ Unauthorized - no session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[UPDATE-API-KEY] User ID:', session.user.id)

    // 2. Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('[UPDATE-API-KEY] ❌ Failed to parse JSON:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { geminiApiKey } = body
    console.log('[UPDATE-API-KEY] API key length:', geminiApiKey?.length || 0)

    // 3. Validate API key
    if (!geminiApiKey || typeof geminiApiKey !== 'string' || geminiApiKey.trim().length === 0) {
      console.log('[UPDATE-API-KEY] ❌ Invalid API key')
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    const trimmedKey = geminiApiKey.trim()

    // 4. Encrypt API key
    console.log('[UPDATE-API-KEY] Encrypting API key...')
    const encryptedKey = await encrypt(trimmedKey)
    console.log('[UPDATE-API-KEY] Encryption done, length:', encryptedKey.length)

    // 5. Check/Create user in database
    console.log('[UPDATE-API-KEY] Checking if user exists...')
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true }
    })

    console.log('[UPDATE-API-KEY] User found:', !!user)

    if (!user) {
      // User doesn't exist - create them
      console.log('[UPDATE-API-KEY] Creating new user...')
      const userEmail = session.user.email || `user-${session.user.id}@app.local`
      
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: userEmail,
            name: session.user.name || 'User',
            password: '',
            role: 'user',
            credits: 500,
            geminiApiKey: encryptedKey  // Set encrypted API key during creation
          },
          select: { id: true, email: true }
        })
        
        console.log('[UPDATE-API-KEY] ✅ User created:', user.id)
        
        return NextResponse.json({
          success: true,
          message: 'User created and API key saved successfully'
        })
        
      } catch (createError: any) {
        console.error('[UPDATE-API-KEY] ❌ Create user error:', createError)
        
        // Check if email already exists (P2002 = unique constraint)
        if (createError.code === 'P2002') {
          console.log('[UPDATE-API-KEY] Email exists, retrying with existing user...')
          
          // Find by email and update
          const existingUser = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { id: true }
          })
          
          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { geminiApiKey: encryptedKey }
            })
            
            console.log('[UPDATE-API-KEY] ✅ Updated existing user by email:', existingUser.id)
            
            return NextResponse.json({
              success: true,
              message: 'API key updated successfully'
            })
          }
        }
        
        // If all fails, return error
        return NextResponse.json(
          { 
            error: 'Failed to create user',
            details: createError.message || String(createError)
          },
          { status: 500 }
        )
      }
    }

    // 6. User exists - update API key
    console.log('[UPDATE-API-KEY] Updating API key for existing user...')
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { geminiApiKey: encryptedKey }
      })
      
      console.log('[UPDATE-API-KEY] ✅ API key updated successfully')
      
      return NextResponse.json({
        success: true,
        message: 'API key updated successfully'
      })
      
    } catch (updateError: any) {
      console.error('[UPDATE-API-KEY] ❌ Update error:', updateError)
      
      return NextResponse.json(
        { 
          error: 'Failed to update API key',
          details: updateError.message || String(updateError)
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[UPDATE-API-KEY] ❌ Unexpected error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}
