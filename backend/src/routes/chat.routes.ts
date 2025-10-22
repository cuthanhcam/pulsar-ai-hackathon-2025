/**
 * 💬 AI Chat Routes
 */

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { chatWithAI } from '../controllers/chat.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.post('/', chatWithAI)

export default router

