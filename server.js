import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js'
 

dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
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
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/grievances', grievanceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.get("/",(req,res)=>{
    res.json({message:"hello world"});
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
