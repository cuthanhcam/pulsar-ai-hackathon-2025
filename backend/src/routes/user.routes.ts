/**
 * 👤 User Routes
 */

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getProfile,
  updateProfile,
  updateApiKey,
  getApiKey,
  getCredits,
} from '../controllers/user.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.get('/profile', getProfile)
router.post('/update-profile', updateProfile)
router.post('/update-api-key', updateApiKey)
router.get('/get-api-key', getApiKey)
router.get('/credits', getCredits)

export default router

