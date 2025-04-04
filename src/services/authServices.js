import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_here';
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
const SALT_ROUNDS = 12;

class AuthService {
  /* ------------------------ OTP Generation ------------------------ */
  static generateOTP() {
    return otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });
  }

  /* ------------------------ Email Service ------------------------ */
  static async sendOTPEmail(email, otp) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code',
        text: `Your OTP code is: ${otp}\nValid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">CampusConnect Verification</h2>
            <p style="font-size: 16px;">Your verification code is:</p>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 2px;">
              <strong>${otp}</strong>
            </div>
            <p style="font-size: 14px; color: #7f8c8d;">This code will expire in 5 minutes.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /* ------------------------ Registration ------------------------ */
  static async registerStudent(studentData) {
    try {
      // Validate PRN format (YYYY033700XXXXXX)
      const prnPattern = /^\d{4}033700\d{6}$/;
      if (!prnPattern.test(studentData.prnNumber)) {
        throw new Error('Invalid PRN format');
      }

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [
          { prnNumber: studentData.prnNumber },
          { email: studentData.email }
        ]
      });

      if (existingUser) {
        throw new Error('User already exists with this PRN or email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(studentData.password, SALT_ROUNDS);

      // Create new student
      const student = new User({
        ...studentData,
        password: hashedPassword,
        role: 'student',
        otp: this.generateOTP(),
        otpExpiry: Date.now() + OTP_EXPIRY
      });

      await student.save();
      await this.sendOTPEmail(student.email, student.otp);

      return {
        id: student._id,
        fullname: student.fullname,
        email: student.email,
        prnNumber: student.prnNumber
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async registerAdmin(adminData) {
    try {
      // Check for existing admin
      const existingAdmin = await User.findOne({
        $or: [
          { dte: adminData.dte },
          { email: adminData.email }
        ]
      });

      if (existingAdmin) {
        throw new Error('Admin already exists with this DTE or email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, SALT_ROUNDS);

      // Create new admin
      const admin = new User({
        ...adminData,
        password: hashedPassword,
        role: 'admin',
        otp: this.generateOTP(),
        otpExpiry: Date.now() + OTP_EXPIRY
      });

      await admin.save();
      await this.sendOTPEmail(admin.email, admin.otp);

      return {
        id: admin._id,
        fullname: admin.fullname,
        email: admin.email,
        dte: admin.dte,
        role: admin.role
      };
    } catch (error) {
      console.error('Admin registration error:', error);
      throw error;
    }
  }

  /* ------------------------ Verification ------------------------ */
  static async verifyOTP(email, otp) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Account already verified');
      }

      if (!user.otp || user.otp !== otp) {
        throw new Error('Invalid verification code');
      }

      if (Date.now() > user.otpExpiry) {
        throw new Error('Verification code expired');
      }

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          prnNumber: user.prnNumber || undefined,
          dte: user.dte || undefined
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          ...(user.role === 'student' && { prnNumber: user.prnNumber }),
          ...(user.role === 'admin' && { dte: user.dte })
        },
        token
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  static async resendOTP(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('Account already verified');
      }

      user.otp = this.generateOTP();
      user.otpExpiry = Date.now() + OTP_EXPIRY;
      await user.save();

      await this.sendOTPEmail(email, user.otp);

      return { message: 'Verification code resent successfully' };
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }

  /* ------------------------ Authentication ------------------------ */
  static async studentLogin(prnNumber, password) {
    try {
      const student = await User.findOne({ prnNumber, role: 'student' });
      if (!student) {
        throw new Error('Invalid credentials');
      }

      if (!student.isVerified) {
        throw new Error('Account not verified. Please check your email.');
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        {
          id: student._id,
          prnNumber: student.prnNumber,
          role: student.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        student: {
          id: student._id,
          fullname: student.fullname,
          email: student.email,
          prnNumber: student.prnNumber,
          semester: student.semester,
          branch: student.branch
        },
        token
      };
    } catch (error) {
      console.error('Student login error:', error);
      throw error;
    }
  }

  static async adminLogin(dte, password) {
    try {
      const admin = await User.findOne({ dte, role: 'admin' });
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        {
          id: admin._id,
          dte: admin.dte,
          role: admin.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        admin: {
          id: admin._id,
          fullname: admin.fullname,
          email: admin.email,
          dte: admin.dte,
          committee: admin.committee
        },
        token
      };
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  /* ------------------------ Password Management ------------------------ */
  static async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign(
        { id: user._id },
        JWT_SECRET + user.password, // Token becomes invalid if password changes
        { expiresIn: '15m' }
      );

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;

      await this.sendPasswordResetEmail(user.email, resetLink);

      return { message: 'Password reset link sent to your email' };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email, resetLink) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Password Reset</h2>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p style="font-size: 12px; color: #7f8c8d;">This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static async resetPassword(userId, token, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Invalid user');
      }

      // Verify token was signed with current password
      jwt.verify(token, JWT_SECRET + user.password);

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.password = hashedPassword;
      await user.save();

      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Invalid or expired reset token');
    }
  }

  /* ------------------------ Profile Management ------------------------ */
  static async getProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password -otp -otpExpiry');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  static async updateProfile(userId, updateData) {
    try {
      // Prevent role changing through this endpoint
      if (updateData.role) {
        delete updateData.role;
      }

      // Handle password update separately
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -otp -otpExpiry');

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  static async deleteProfile(userId) {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) {
        throw new Error('User not found');
      }
      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }
}

export default AuthService;