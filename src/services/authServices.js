import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import the user model

// Register new user
export const registerUser = async (data) => {
    try {
        // Ensure prnNumber uniqueness instead of email only if you want to use prnNumber for login
        const existingUser = await User.findOne({ prnNumber: data.prnNumber });
        if (existingUser) throw new Error('User with this PRN number already exists');

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

export const loginUser = async ({ prnNumber, password }) => {
    try {
        // Find user by prnNumber
        const user = await User.findOne({ prnNumber });
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
