import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'your_jwt_secret';
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

class AuthService {
    static async registerStudent(data) {
        const user = new User(data);
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(user.email, otp);
        return user;
    }

    static async registerAdmin(data) {
        const admin = new User({ ...data, role: 'admin' });
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
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

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #102C57; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">CampusConnect</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #102C57; margin-top: 0;">Your OTP Code</h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">Your verification code is:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #102C57;">
                    ${otp}
                </div>
                <p style="font-size: 16px;">This code is valid for 5 minutes. Please do not share it with anyone.</p>
                <p style="font-size: 16px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 14px; color: #666;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Government College of Engineering Chandrapur</p>
            </div>
        </div>
        `;

        await transporter.sendMail({
            from: '"CampusConnect" <razakhanahmad68@gmail.com>',
            to: email,
            subject: 'Your Registration OTP Code',
            html: htmlContent,
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        });
    }

    // All other methods remain exactly the same as in your original code
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

    static async resendOTP(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (user.isVerified) throw new Error('User is already verified');

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(email, otp);
        return { message: 'OTP resent successfully' };
    }
    
    static async login(prnNumber, password) {
        const user = await User.findOne({ prnNumber });
        if (!user) throw new Error('User not found');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new Error('Invalid password');
        const token = jwt.sign({ id: user._id, prnNumber: user.prnNumber }, JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    static async adminLogin(dte, password) {
        const admin = await User.findOne({ dte });
        if (!admin) throw new Error('Admin not found');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) throw new Error('Invalid password');
        const token = jwt.sign({ id: admin._id, dte: admin.dte }, JWT_SECRET, { expiresIn: '1h' });
        return { admin, token };
    }

    static async getProfile(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        return user;
    }

    static async updateProfile(userId, data) {
        const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
        if (!updatedUser) throw new Error('User not found');
        return updatedUser;
    }

    static async deleteProfile(userId) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) throw new Error('User not found');
        return;
    }

    static async verifyOTP(email, otp) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (user.otp !== otp || Date.now() > user.otpExpiry) throw new Error('Invalid or expired OTP');
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        return user;
    }

    static async resetPassword(email, newPassword) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        user.password = newPassword;
        await user.save();
        return user;
    }
}

export default AuthService;