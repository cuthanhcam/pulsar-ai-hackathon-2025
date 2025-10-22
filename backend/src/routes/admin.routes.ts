/**
 * 👑 Admin Routes
 */

import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// All routes require admin authentication
router.use(authenticateToken)
router.use(requireAdmin)

// Admin routes will be implemented here
router.get('/stats', (_req, res) => {
  res.json({ message: 'Admin stats - to be implemented' })
})

export default router

