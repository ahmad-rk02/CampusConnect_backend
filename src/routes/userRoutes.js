import { Router } from 'express';
import { login, register, getUserProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Import your auth middleware

const router = Router();

// Create a new user
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getUserProfile); // Add this line to fetch user profile

export default router;
