import express from 'express';
import AuthController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes
router.post('/student/signup', AuthController.studentSignup);
router.post('/student/login', AuthController.studentLogin);
router.get('/student/profile', authMiddleware, AuthController.getStudentProfile);
router.put('/student/update', authMiddleware, AuthController.updateStudentProfile);
router.delete('/student/delete', authMiddleware, AuthController.deleteStudentProfile);

// Admin routes
router.post('/admin/signup', AuthController.adminSignup);
router.post('/admin/login', AuthController.adminLogin);
router.get('/admin/profile', authMiddleware, AuthController.getAdminProfile);
router.put('/admin/update', authMiddleware, AuthController.updateAdminProfile);
router.delete('/admin/delete', authMiddleware, AuthController.deleteAdminProfile);

// OTP routes
router.post('/verify-signup-otp', AuthController.verifySignupOTP);
router.post('/resend-signup-otp', AuthController.resendSignupOTP); // New route
router.post('/send-otp', AuthController.sendResetOTP);
router.post('/verify-otp', AuthController.verifyResetOTP);
router.post('/reset-password', AuthController.resetPassword);

export default router;