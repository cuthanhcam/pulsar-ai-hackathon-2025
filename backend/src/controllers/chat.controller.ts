/**
 * 💬 Chat Controller
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Chat with AI - to be implemented' })
}

