import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'your_jwt_secret'; // Use a secure key in a real application
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

class AuthService {
    static async registerStudent(data) {
        const user = new User(data);
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(user.email, otp);
        return user;
    }

    static async registerAdmin(data) {
        const admin = new User({ ...data, role: 'admin' });
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        admin.otp = otp;
        admin.otpExpiry = Date.now() + OTP_EXPIRY;
        await admin.save();
        await this.sendOTP(admin.email, otp);
        return admin;
    }

    static async sendOTP(email, otp) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'razakhanahmad68@gmail.com',
                pass: 'kbol dggl zzzt xumr',
            },
        });

        await transporter.sendMail({
            from: '"CampusConnect" <razakhanahmad68@gmail.com>',
            to: email,
            subject: 'Your Registration OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });
    }

    static async verifySignupOTP(email, otp) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (user.otp !== otp || Date.now() > user.otpExpiry) {
            throw new Error('Invalid or expired OTP');
        }
        user.otp = null;
        user.otpExpiry = null;
        user.isVerified = true;
        await user.save();
        return user;
    }

    // New method to resend OTP
    static async resendOTP(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (user.isVerified) throw new Error('User is already verified');

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(email, otp);
        return { message: 'OTP resent successfully' };
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

    // Generate and send OTP
    static async sendOTP(email) {
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        // Save OTP and its expiry in user record
        const user = await User.findOneAndUpdate(
            { email },
            { otp, otpExpiry: Date.now() + OTP_EXPIRY },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Configure the email transport
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email service
            auth: {
                user: 'razakhanahmad68@gmail.com', // Your email
                pass: 'kbol dggl zzzt xumr', // Your email password or app-specific password
            },
        });

        // Send the OTP via email
        await transporter.sendMail({
            from: '"CampusConnect"<razakhanahmad68@gmail.com>',
            to: user.email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });

        return user; // Return user for further operations if needed
    }

    // Verify OTP
    static async verifyOTP(email, otp) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.otp !== otp || Date.now() > user.otpExpiry) {
            throw new Error('Invalid or expired OTP');
        }

        // Clear OTP after successful verification
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return user;
    }

    // Reset password
    static async resetPassword(email, newPassword) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }

        user.password = newPassword; // This will trigger password hashing in the pre-save hook
        await user.save();

        return user;
    }
}

export default AuthService;