/**
 * 📖 Sections Routes
 */

import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import {
  getSection,
  completeSection,
} from '../controllers/sections.controller'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.post('/:id', getSection)
router.post('/:id/complete', completeSection)

export default router

