/**
 * 📖 Sections Controller
 */

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'

export const getSection = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Get section - to be implemented', id: req.params.id })
}

export const completeSection = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Complete section - to be implemented', id: req.params.id })
}

