import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the app
const app = express();

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173', // Add local dev URL (adjust port if different)
    'https://gcoec-campusconnect.netlify.app', // Your frontend URL
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman) or if origin is in allowedOrigins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and headers if needed
}));

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process on failure
    }
};

connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/grievances', grievanceRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export for Vercel (no app.listen for serverless)
export default app;