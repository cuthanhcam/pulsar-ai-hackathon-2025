/**
 * 🎯 Quiz Routes
 */

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { generateQuiz, submitQuiz } from '../controllers/quiz.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.post('/generate', generateQuiz)
router.post('/submit', submitQuiz)

export default router

