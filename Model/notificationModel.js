import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false   // ✅ مهم جدا باش ما يطيحش error
    },

    type: {
        type: String,
        enum: ["course", "quiz", "info"],
        required: true
    },

    title: String,
    message: String,

    relatedId: {
        type: Schema.Types.ObjectId,
        required: false
    },

    is_read: {
        type: Boolean,
        default: false
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

export default model("Notification", notificationSchema);