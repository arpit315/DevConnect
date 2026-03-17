// --- WHAT IS THIS FILE? ---
// This is our main Express application configuration file.
// We separate 'app.js' from 'server.js' as a best practice.
// app.js handles all the routing, middleware, and logic.
// server.js handles starting the actual HTTP server and listening on a port.
// This separation makes our app easier to test later without starting a server!
// --------------------------

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Initialize the Express app
const app = express();

// --- MIDDLEWARES ---
// Middlewares are functions that run before your routes handle the request.
// They can modify the request/response or end the request early (e.g. if unauthorized).

// 1. Helmet: Adds security-related HTTP headers to protect against common web vulnerabilities.
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing): Allows our React frontend (running on a different port)
// to make API requests to this backend without the browser blocking them.
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173", // URL of our Vite React app
        credentials: true, // Allow cookies (like our auth tokens) to be sent across origins
    })
);

// 3. Built-in body parsers: To read JSON data sent from the frontend in req.body
app.use(express.json({ limit: "16kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded bodies (from forms)

// 4. Cookie Parser: Parses cookies attached to the client request object.
// We will use this to securely store our JWT Refresh Token.
app.use(cookieParser());

// --- ROUTES ---
// Import routes
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import messageRouter from "./routes/message.routes.js";

// Route declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/messages", messageRouter);

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "DevConnect API is running!" });
});

// 5. Global Error Handling Middleware
// To return custom ApiError instances as clean JSON instead of HTML stack traces
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
    });
});

// Export the app so server.js can start it.
export { app };
