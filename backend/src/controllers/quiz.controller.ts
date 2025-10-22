/**
 * 🎯 Quiz Controller
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'

export const generateQuiz = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Generate quiz - to be implemented' })
}

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Submit quiz - to be implemented' })
}

