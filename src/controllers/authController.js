import { registerUser, loginUser } from '../services/authServices.js';
import { validationResult } from 'express-validator'; // For validation
import User from '../models/User.js'; // Import your User model

// Register Controller
export const register = async (req, res) => {
    const { fullname, email, password, phone, prnNumber, semester, branch, dte, committee } = req.body;

    console.log("Received register request body:", req.body);

    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Determine the role (admin if dte is provided, otherwise user)
        const role = dte ? 'admin' : 'user';

        // Register the user using the service logic
        const { token, user } = await registerUser({
            fullname,
            email,
            password,
            phone,
            prnNumber,
            semester,
            branch,
            dte,
            committee,
            role
        });

        res.status(201).json({ token, user });
    } catch (error) {
        console.error("Registration error:", error.message);
        if (error.message === 'User with this PRN number or DTE already exists') {
            return res.status(409).json({ msg: error.message });
        }
        res.status(400).json({ msg: error.message });
    }
};

// Login Controller
export const login = async (req, res) => {
    const { prnNumber, password, dte } = req.body;

    console.log("Received login request body:", req.body);

    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Use dte for admin login, prnNumber for user login
        const credentials = dte ? { dte, password } : { prnNumber, password };
        const { token, user } = await loginUser(credentials);

        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(401).json({ msg: error.message });
    }
};

// Get User Profile Controller
export const getUserProfile = async (req, res) => {
    try {
        console.log("user profile",req.body)
        const user = await User.findById(req.user); // Fetch user based on the ID decoded from the token
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Create a response object, excluding sensitive data
        const { password, ...userData } = user._doc; // Exclude password from the response
        res.json(userData); // Send user data back
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ msg: 'Server error' });
    }
};
