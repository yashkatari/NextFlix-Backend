import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectdb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Set port from environment variable or default to 5000
const port = process.env.PORT || 5000;

// Middleware setup
app.use(express.json({ limit: '50mb' }));  // Parse incoming JSON data
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded data
app.use(cookieParser());  // Parse cookies

// CORS setup (allow frontend to communicate with backend)
app.use(cors({
  origin: 'https://nextflixmovie.netlify.app',  // Replace with your actual Netlify frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true  // Allow cookies for authentication
}));

// Routes setup
app.use('/api/users', userRoutes);  // API route for user-related actions

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port} port hey`);
});
