/**
 * 🔐 Authentication Controller
 */

import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { generateToken } from '../utils/jwt'
import { CREDITS } from '../utils/gemini'
import { AuthRequest } from '../middleware/auth'

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        credits: CREDITS.DEFAULT_USER, // 500 free credits
        role: 'user'
      }
    })

    // Create progress record
    await prisma.progress.create({
      data: { userId: user.id }
    })

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        role: user.role
      }
    })
  } catch (error) {
    console.error('[Auth] Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        role: user.role
      }
    })
  } catch (error) {
    console.error('[Auth] Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

/**
 * Verify password for sensitive operations
 */
export const verifyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body
    const userId = req.user?.id

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    res.json({ message: 'Password verified' })
  } catch (error) {
    console.error('[Auth] Password verification error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
}

/**
 * Get current user info
 */
export const me = async (req: AuthRequest, res: Response) => {
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
    console.error('[Auth] Get user error:', error)
    res.status(500).json({ error: 'Failed to get user info' })
  }
}

