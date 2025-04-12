import express from 'express';
import dotenv from "dotenv";
import connectDB from './db/connectdb.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import userRoutes from './routes/userRoutes.js'

const app = express();

dotenv.config();
connectDB();
const port = process.env.PORT || 5000;


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));

// // Routes
app.use('/api/users', userRoutes);

app.listen(port, () => console.log(`listening on ${port} port hey`));
