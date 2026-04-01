import { Schema, model } from "mongoose";

// Lesson Schema
const lessonSchema = new Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ["video","PDF"],
        default: "video"
    },
    duration: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    content: { type: String, default: "" },
});

// Chapter Schema 
const chapterSchema = new Schema({
    title: { type: String, required: true },
    duration: { type: String, required: true },
    preview: { type: String, default: "" },
    order: { type: Number, default: 0 },
    lessons: [lessonSchema]
});

// Resource Schema
const resourceSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String, default: "#" },
    fileUrl: { type: String, default: "" }
});

// Main Course Schema
const courseSchema = new Schema({
    Title: {
        type: String,
        required: true,
        trim: true
    },
    Description: {
        type: String,
        required: true,
    },
    Instructor: {
        type: Schema.Types.ObjectId,
        ref: "userModel",
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["frontend", "backend", "database", "tools", "design", "deployment"],
    },
    image: {
        type: String,
        required: true,
    },
    totalDuration: {
        type: String,
        default: "Coming soon"
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    price: {
        type: Number,
        default: 0
    },
    rating: [
        {
            userId: String,
            value: Number,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    chapters: [chapterSchema],
    resources: [resourceSchema],
    enrolledStudents: [{
        type: Schema.Types.ObjectId,
        ref: "userModel"
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

//for better query performance
courseSchema.index({ Title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ Instructor: 1 });
courseSchema.index({ isPublished: 1 });

const courseModel = model("course", courseSchema);
export default courseModel;