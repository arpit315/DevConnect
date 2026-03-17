// --- WHAT IS THIS FILE? ---
// We write our database connection logic here.
// Mongoose is an ODM (Object Data Modeling) library for MongoDB.
// It allows us to interact with MongoDB using Javascript objects instead of raw queries.
// --------------------------

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Here we attempt to connect to the database cluster URL from our .env file.
        // We append the database name "devconnect" to the URI.
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/devconnect`);

        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        // If the DB fails to connect, our app cannot function, so we exit the Node process.
        process.exit(1);
    }
}

export default connectDB;
