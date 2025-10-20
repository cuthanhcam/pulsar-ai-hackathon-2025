import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering (disable static optimization)
export const dynamic = 'force-dynamic'

// GET: Get single user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            completed: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        quizResults: {
          select: {
            id: true,
            score: true,
            completedAt: true,
            quiz: {
              select: {
                title: true
              }
            }
          },
          orderBy: { completedAt: 'desc' },
          take: 10
        },
        progress: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Serialize BigInt to Number
    const serializedUser = {
      ...user,
      credits: Number(user.credits)
    }

    return NextResponse.json({ user: serializedUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH: Update user (credits, role, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    )
  }

  try {
    const body = await req.json()
    const { credits, role, name, email, phone } = body

    // Prevent self role change
    if (role && params.id === authCheck.userId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (credits !== undefined) updateData.credits = Number(credits)
    if (role) updateData.role = role
    if (name !== undefined) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        credits: true,
        updatedAt: true
      }
    })

    // Serialize BigInt to Number
    const serializedUser = {
      ...user,
      credits: Number(user.credits)
    }

    return NextResponse.json({ 
      user: serializedUser,
      message: 'User updated successfully' 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE: Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    )
  }

  try {
    // Prevent self deletion
    if (params.id === authCheck.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
