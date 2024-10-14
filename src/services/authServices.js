import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Register new user or admin
export const registerUser = async (data) => {
    try {
        // Ensure uniqueness for PRN (user) or DTE (admin)
        const existingUser = await User.findOne({ $or: [{ prnNumber: data.prnNumber }, { dte: data.dte }] });
        if (existingUser) throw new Error('User with this PRN number or DTE already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new User({ ...data, password: hashedPassword });
        await user.save();

        const token = generateToken(user._id);

        return { token, user: { ...user.toObject(), password: undefined } };
    } catch (error) {
        console.error("Registration error:", error.message);
        throw new Error(error.message);
    }
};

// Login service for both user and admin
export const loginUser = async ({ prnNumber, password, dte }) => {
    try {
        // Find by DTE if it's admin login, otherwise by PRN for user login
        const user = dte
            ? await User.findOne({ dte })
            : await User.findOne({ prnNumber });

        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = generateToken(user._id);
        return { token, user: { ...user.toObject(), password: undefined } };
    } catch (error) {
        console.error("Login error:", error.message);
        throw new Error(error.message);
    }
};

// Generate JWT token
export const generateToken = (userId) => {
    const payload = { userId };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    return token;
};
