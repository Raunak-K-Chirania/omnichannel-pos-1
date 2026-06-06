import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { protect } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: User registered successfully
 */
// POST /api/auth/register — Create a new user
router.post('/register', register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 */
// POST /api/auth/login — Authenticate & get token
router.post('/login', login);


/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 */
// GET  /api/auth/me — Get logged-in user (protected)
router.get("/me", protect, getMe);

// GET  /api/auth/profile — Get logged-in user profile (protected)
router.get("/profile", protect, getMe);

// POST /api/auth/logout — Log out user
router.post("/logout", logout);

export default router;