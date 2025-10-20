import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sectionId = params.id

    // Update section completion status
    const section = await prisma.section.update({
      where: { id: sectionId },
      data: { completed: true }
    })

    return NextResponse.json({ 
      success: true,
      section 
    })

  } catch (error) {
    console.error('[API] Complete section error:', error)
    return NextResponse.json(
      { error: 'Failed to mark section as complete' },
      { status: 500 }
    )
  }
}

