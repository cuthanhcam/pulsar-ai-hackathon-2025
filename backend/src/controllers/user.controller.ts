/**
 * 👤 User Controller
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { prisma } from '../config/database'
import { encrypt, decrypt } from '../utils/encryption'
import bcrypt from 'bcryptjs'

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        credits: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('[User] Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { name, phone, currentPassword, newPassword } = req.body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    // Update password if provided
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        credits: true,
        role: true
      }
    })

    res.json({ message: 'Profile updated successfully', user: updatedUser })
  } catch (error) {
    console.error('[User] Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

export const updateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' })
    }

    // Encrypt API key before storing
    const encryptedKey = encrypt(apiKey)

    await prisma.user.update({
      where: { id: userId },
      data: { geminiApiKey: encryptedKey }
    })

    res.json({ message: 'API key updated successfully' })
  } catch (error) {
    console.error('[User] Update API key error:', error)
    res.status(500).json({ error: 'Failed to update API key' })
  }
}

export const getApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKey: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const hasApiKey = !!user.geminiApiKey

    res.json({ hasApiKey })
  } catch (error) {
    console.error('[User] Get API key error:', error)
    res.status(500).json({ error: 'Failed to check API key' })
  }
}

export const getCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ credits: user.credits })
  } catch (error) {
    console.error('[User] Get credits error:', error)
    res.status(500).json({ error: 'Failed to get credits' })
  }
}

