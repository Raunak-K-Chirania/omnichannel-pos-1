import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/register — Create a new user
router.post('/register', register);

// POST /api/auth/login — Authenticate & get token
router.post('/login', login);

// GET  /api/auth/me — Get logged-in user (protected)
router.get('/me', authMiddleware, getMe);

export default router;