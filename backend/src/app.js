import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
const app = express();
app.use(helmet());
app.use(
    cors({
        origin: dev-connect-ruby.vercel.app,

        credentials: true, 
    })
);
app.use(express.json({ limit: "16kb" })); 
app.use(express.urlencoded({ extended: true, limit: "16kb" })); 
app.use(cookieParser());
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import messageRouter from "./routes/message.routes.js";
import projectRouter from "./routes/project.routes.js";
import notificationRouter from "./routes/notification.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/notifications", notificationRouter);
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "DevConnect API is running!" });
});
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = field ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` : "Duplicate field value entered";
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(", ");
    }
    return res.status(statusCode).json(new ApiResponse(statusCode, err, message));
});
export { app };
