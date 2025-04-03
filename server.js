import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';
import Visitor from './src/models/Visitor.js';
import visitorRoutes from './src/routes/visitorRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Local development (adjust port if different)
  'https://gcoec-campusconnect.netlify.app', // Your deployed frontend domain
  // Add any other frontend domains as needed
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you’re sending cookies or auth tokens
}));

// Middleware
app.use(express.json());

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
    process.exit(1);
  }
};
connectDB();

// Initialize visitor count
Visitor.initializeCount();


// Routes
app.use('/api/users', userRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/visitors', visitorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;