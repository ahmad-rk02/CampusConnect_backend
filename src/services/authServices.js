import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'your_jwt_secret';
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

class AuthService {
    // Generate guaranteed 6-digit numeric OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Common OTP email sender with styling
    static async sendOTP(email, otp, purpose = 'Verification') {
        try {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'razakhanahmad68@gmail.com',
                    pass: 'kbol dggl zzzt xumr',
                },
            });

            const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
                .header { background-color: #102C57; padding: 20px; text-align: center; }
                .header h1 { color: white; margin: 0; }
                .content { padding: 20px; }
                .otp-display { font-size: 24px; letter-spacing: 3px; color: #102C57; font-weight: bold; text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
                .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CampusConnect</h1>
                </div>
                <div class="content">
                    <h2>Your ${purpose} OTP</h2>
                    <p>Hello,</p>
                    <p>Please use the following OTP to complete your ${purpose.toLowerCase()}:</p>
                    <div class="otp-display">${otp}</div>
                    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Government College of Engineering Chandrapur</p>
                </div>
            </div>
        </body>
        </html>
        `;

            const mailOptions = {
                from: '"CampusConnect" <razakhanahmad68@gmail.com>',
                to: email,
                subject: `Your ${purpose} OTP Code`,
                html: emailTemplate,
                text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
            };

            await transporter.sendMail(mailOptions);
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw new Error('Failed to send OTP');
        }
    }

    static async sendResetOTP(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');

            const otp = this.generateOTP();
            user.otp = otp;
            user.otpExpiry = Date.now() + OTP_EXPIRY;
            await user.save();

            await this.sendOTP(email, otp, 'Password Reset');
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Error in sendResetOTP:', error);
            throw error;
        }
    }

    static async verifyResetOTP(email, otp) {
        try {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');
            if (user.otp !== otp || Date.now() > user.otpExpiry) {
                throw new Error('Invalid or expired OTP');
            }
            user.otp = null;
            user.otpExpiry = null;
            await user.save();
            return { success: true, message: 'OTP verified successfully' };
        } catch (error) {
            console.error('Error in verifyResetOTP:', error);
            throw error;
        }
    }

    static async resetPassword(email, newPassword) {
        try {
            const user = await User.findOne({ email });
            if (!user) throw new Error('User not found');

            user.password = newPassword;
            await user.save();

            return { success: true, message: 'Password reset successfully' };
        } catch (error) {
            console.error('Error in resetPassword:', error);
            throw error;
        }
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

    static async resendOTP(email) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        if (user.isVerified) throw new Error('User is already verified');

        const otp = this.generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(email, otp, 'Verification');
        return { message: 'OTP resent successfully' };
    }

    // Original methods with numeric OTP
    static async registerStudent(data) {
        const user = new User(data);
        const otp = this.generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_EXPIRY;
        await user.save();
        await this.sendOTP(user.email, otp, 'Registration');
        return user;
    }

    static async registerAdmin(data) {
        const admin = new User({ ...data, role: 'admin' });
        const otp = this.generateOTP();
        admin.otp = otp;
        admin.otpExpiry = Date.now() + OTP_EXPIRY;
        await admin.save();
        await this.sendOTP(admin.email, otp, 'Registration');
        return admin;
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
        if (user.otp !== otp || Date.now() > user.otpExpiry) {
            throw new Error('Invalid or expired OTP');
        }
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