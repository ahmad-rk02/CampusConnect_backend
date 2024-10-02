import { registerUser, loginUser } from '../services/authServices.js';
import { validationResult } from 'express-validator'; // For validation

// Register Controller
export const register = async (req, res) => {
    const { fullname, email, password, phone, prnNumber, semester, branch } = req.body;

    console.log("Received register request body:", req.body);

    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Register the user using your service logic
        const { token, user } = await registerUser({
            fullname,
            email,
            password,
            phone,
            prnNumber,
            semester,
            branch
        });

        // Respond with the token and user data after successful registration
        res.status(201).json({ token, user });
    } catch (error) {
        console.error("Registration error:", error.message);
        if (error.message === 'User with this PRN number already exists') {
            return res.status(409).json({ msg: error.message }); // Conflict
        }
        res.status(400).json({ msg: error.message });
    }
};

// Login Controller
export const login = async (req, res) => {
    const { prnNumber, password } = req.body;

    console.log("Received login request body:", req.body);

    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { token, user } = await loginUser({ prnNumber, password });

        // Respond with the token and user data after successful login
        res.status(200).json({ token, user });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(401).json({ msg: error.message }); // Unauthorized
    }
};
