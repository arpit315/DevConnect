// --- WHAT IS THIS FILE? ---
// This is the ENTRY POINT of our backend application.
// Its only job is to:
// 1. Load environment variables.
// 2. Connect to the MongoDB Database.
// 3. Start the Express server defined in app.js on a specific port.
// 4. (Later) Attach Socket.io for real-time chat.
// --------------------------

import dotenv from "dotenv";
import { server } from "./socket/socket.js";
import connectDB from "./config/db.js";

// 1. Load environment variables from our .env file into process.env
// We do this at the very top so everything else can use these variables.
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

// 2. Database connection & Server Startup
// `server` (which wraps `app` and `io`) is imported from socket.js
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`\n⚙️  Server is running at port : ${port}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });
