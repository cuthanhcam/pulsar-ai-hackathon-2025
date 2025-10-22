/**
 * 🔐 Authentication Routes
 */

import { Router } from 'express'
import { register, login, verifyPassword, me } from '../controllers/auth.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-password', authenticateToken, verifyPassword)
router.get('/me', authenticateToken, me)

export default router

