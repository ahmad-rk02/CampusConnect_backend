import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Import middleware

const router = express.Router();

// Student routes
router.post('/student/signup', AuthController.studentSignup);
router.post('/student/login', AuthController.studentLogin);
router.get('/student/profile', authMiddleware, AuthController.getStudentProfile);
router.put('/student/update', authMiddleware, AuthController.updateStudentProfile); // Update student profile
router.delete('/student/delete', authMiddleware, AuthController.deleteStudentProfile); // Delete student profile

// Admin routes
router.post('/admin/signup', AuthController.adminSignup);
router.post('/admin/login', AuthController.adminLogin);
router.get('/admin/profile', authMiddleware, AuthController.getAdminProfile);
router.put('/admin/update', authMiddleware, AuthController.updateAdminProfile); // Update admin profile
router.delete('/admin/delete', authMiddleware, AuthController.deleteAdminProfile); // Delete admin profile

export default router;
