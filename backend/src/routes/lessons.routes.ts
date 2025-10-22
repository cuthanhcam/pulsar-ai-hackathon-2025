/**
 * 📚 Lessons/Courses Routes
 */

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getLessons,
  getLesson,
  generateLesson,
  deleteLesson,
  cloneLesson,
} from '../controllers/lessons.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.get('/', getLessons)
router.get('/:id', getLesson)
router.post('/generate', generateLesson)
router.post('/clone', cloneLesson)
router.delete('/:id/delete', deleteLesson)

export default router

