import AuthService from '../services/authServices.js';
import jwt from 'jsonwebtoken'; // Add this import

const JWT_SECRET = 'your_jwt_secret'; //
class AuthController {
    static async studentSignup(req, res) {
        try {
            // Validate PRN format before proceeding
            const prnPattern = /^\d{4}033700\d{6}$/;
            if (!prnPattern.test(req.body.prnNumber)) {
                return res.status(400).json({ error: "Invalid PRN format" });
            }

            const user = await AuthService.registerStudent(req.body);
            res.status(201).json({ 
                message: 'OTP sent to email. Please verify to complete registration.', 
                userId: user._id 
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async adminSignup(req, res) {
        try {
            const admin = await AuthService.registerAdmin(req.body);
            res.status(201).json({ message: 'OTP sent to email. Please verify to complete registration.', userId: admin._id });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async verifySignupOTP(req, res) {
        const { email, otp } = req.body;
        try {
            const user = await AuthService.verifySignupOTP(email, otp);
            const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' }); // Use JWT_SECRET here
            res.status(200).json({ message: 'Registration confirmed!', user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async resendSignupOTP(req, res) {
        const { email } = req.body;
        try {
            const result = await AuthService.resendOTP(email);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Student login
    static async studentLogin(req, res) {
        try {
            const { prnNumber, password } = req.body;
            const { user, token } = await AuthService.login(prnNumber, password);
            res.status(200).json({ message: 'Login successful', user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Admin login
    static async adminLogin(req, res) {
        try {
            const { dte, password } = req.body;
            const { admin, token } = await AuthService.adminLogin(dte, password);
            res.status(200).json({ message: 'Login successful', admin, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Get student profile
    static async getStudentProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await AuthService.getProfile(userId);
            if (!user) {
                return res.status(404).json({ message: 'Student not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update student profile
    static async updateStudentProfile(req, res) {
        try {
            const userId = req.user.id;
            const updatedUser = await AuthService.updateProfile(userId, req.body);
            res.status(200).json({ message: 'Student profile updated successfully', updatedUser });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete student profile
    static async deleteStudentProfile(req, res) {
        try {
            const userId = req.user.id;
            await AuthService.deleteProfile(userId);
            res.status(200).json({ message: 'Student profile deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get admin profile
    static async getAdminProfile(req, res) {
        try {
            const adminId = req.user.id;
            const admin = await AuthService.getProfile(adminId);
            if (!admin || admin.role !== 'admin') {
                return res.status(404).json({ message: 'Admin not found' });
            }
            res.status(200).json(admin);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update admin profile
    static async updateAdminProfile(req, res) {
        try {
            const adminId = req.user.id;
            const updatedAdmin = await AuthService.updateProfile(adminId, req.body);
            res.status(200).json({ message: 'Admin profile updated successfully', updatedAdmin });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete admin profile
    static async deleteAdminProfile(req, res) {
        try {
            const adminId = req.user.id;
            await AuthService.deleteProfile(adminId);
            res.status(200).json({ message: 'Admin profile deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Send OTP for password reset
    static async sendResetOTP(req, res) {
        try {
            const { email } = req.body;
            const user = await AuthService.sendOTP(email);
            res.status(200).json({ message: 'OTP sent to your email', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Verify OTP
    static async verifyResetOTP(req, res) {
        try {
            const { email, otp } = req.body;
            const user = await AuthService.verifyOTP(email, otp);
            res.status(200).json({ message: 'OTP verified successfully', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // Reset password
    static async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;
            const user = await AuthService.resetPassword(email, newPassword);
            res.status(200).json({ message: 'Password reset successfully', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}



export default AuthController;