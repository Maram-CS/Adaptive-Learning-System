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
        required: true
    },
    type: {
        type: String,
        enum: ["course", "quiz", "info"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        required: true
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

// Index for faster queries
notificationSchema.index({ studentId: 1, created_at: -1 });
notificationSchema.index({ studentId: 1, is_read: 1 });

const notificationModel = model("Notification", notificationSchema);

export default notificationModel;