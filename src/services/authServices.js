import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'your_jwt_secret'; // Use a secure key in a real application

class AuthService {
    // Register student
    static async registerStudent(data) {
        const user = new User(data);
        await user.save();
        return user;
    }

    // Register admin
    static async registerAdmin(data) {
        const admin = new User({ ...data, role: 'admin' });
        await admin.save();
        return admin;
    }

    // Login logic for students
    static async login(prnNumber, password) {
        const user = await User.findOne({ prnNumber });
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, prnNumber: user.prnNumber }, JWT_SECRET, { expiresIn: '1h' });

        return { user, token };
    }

    // Login logic for admins
    static async adminLogin(dte, password) {
        const admin = await User.findOne({ dte });
        if (!admin) {
            throw new Error('Admin not found');
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        // Generate JWT token for admin
        const token = jwt.sign({ id: admin._id, dte: admin.dte }, JWT_SECRET, { expiresIn: '1h' });

        return { admin, token };
    }

    // Get profile
    static async getProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    // Update profile
    static async updateProfile(userId, data) {
        const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }

    // Delete profile
    static async deleteProfile(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return;
    }
}

export default AuthService;