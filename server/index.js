import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ContactRoutes.js';
import setupSocket from './socket.js';
import messagesRoutes from './routes/MessagesRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import channelRoutes from './routes/ChannelRoutes.js';

// Load environment variables
dotenv.config();

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Serve static files from the 'uploads/files' directory
app.use('/uploads/files', express.static(path.join(__dirname, 'uploads', 'files')));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel",channelRoutes)

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Setup WebSocket
setupSocket(server);

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });

    // according to YT

// import express from "express"
// import mongoose from "mongoose"
// import dotenv from "dotenv"
// import cookieParser from "cookie-parser"
// import cors from "cors"
// import authRoutes from "./routes/AuthRoutes.js"
// import contactsRoutes from "./routes/ContactRoutes.js"
// import setupSocket from "./socket.js"
// import  messagesRoutes from "./routes/MessagesRoutes.js"
// dotenv.config();


// const app = express();
// app.use(cors(
//     {
//         origin: [process.env.ORIGIN],
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//         credentials: true
//     }
// ))
// app.use(cookieParser())
// app.use(express.json())
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI

// app.use("/api/auth", authRoutes);
// app.use("/api/contacts",contactsRoutes);
// app.use("/api/messages",messagesRoutes);
// app.use("/uploads/files",express.static("/uploads/files"));




// const server = app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })

// setupSocket(server);

// mongoose.connect(MONGO_URI)
//     .then(() => console.log("Database connected successfully"))
//     .catch((err) => {
//         console.error("Database connection error:", err.message);
//     });
