import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectdb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();
const allowedOrigins = [
  'https://nextflixmovie.netlify.app',  // Replace with the actual Netlify production URL
  'http://localhost:5173',  // Localhost URL for development testing
  'https://nextflix-backend-6c87.onrender.com' // The URL for your backend service
];
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
  origin: (origin, callback) => {
    // Allow requests from the allowed origins
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow this origin'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Allow cookies for authentication
}));

// Explicitly handle preflight requests if necessary
app.options('*', cors()); // Enable preflight requests for all routes


// Routes setup
app.use('/api/users', userRoutes);  // API route for user-related actions

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port} port hey`);
});
