import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        // We could add 'isRead', 'attachments', etc. later if needed.
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
    }
);

export const Message = mongoose.model("Message", messageSchema);
