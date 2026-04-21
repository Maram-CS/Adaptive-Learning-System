import { Schema, model } from "mongoose";
import slugify from "slugify";
import userModel from "./userModel.js";

// Lesson Schema - CORRIGÉ
const lessonSchema = new Schema({
    name: { type: String, required: true },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },

    type: { 
        type: String, 
        enum: ["video", "PDF"],
        default: "video"
    },

    duration: { type: String, required: true },

    file: { type: String, default: "" },

    videoUrl: { type: String, default: "" },

    content: { type: String, default: "" },
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
        ref: "User",
        required: false,
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

    averageRating: {
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

    lessons: [lessonSchema],

   // Dans courseModel.js - Modifier le schema quizzes
    quizzes: [
    {
        title: { type: String, required: true },
        level: {  // ← AJOUTER CE CHAMP
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: true
        },
        questions: [
        {
            question: { type: String, required: true },
            options: {
            type: [String],
            required: true
            },
            correctAnswer: {
            type: Number,
            required: true
            }
        }
        ],
        passingScore: {  // ← AJOUTER
        type: Number,
        default: 70
        },
        createdAt: {
        type: Date,
        default: Date.now
        }
    }
    ],
        

    placementQuiz: {
        type: {
            title: { type: String, required: true },
            passingScore: { type: Number, default: 70 },
            questions: [
                {
                    question: { type: String, required: true },
                    options: { type: [String], required: true },
                    correctAnswer: { type: Number, required: true }
                }
            ]
        },
        required: false
    },

    resources: [resourceSchema],

    enrolledStudents: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],

    isPublished: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: true,
        required: false,
        lowercase: true,
        trim: true
    },
    

}, { timestamps: true });

// Calculate Average Rating Automatically
courseSchema.pre("save", function () {
    if (this.rating.length === 0) {
        this.averageRating = 0;
    } else {
        const total = this.rating.reduce((acc, item) => acc + item.value, 0);
        this.averageRating = total / this.rating.length;
    }
});

courseSchema.pre("save", function() {
    if (this.isModified("Title") && !this.slug) {
        this.slug = slugify(this.Title, { lower: true, strict: true });
    }
});

// Indexes
courseSchema.index({ Title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ Instructor: 1 });
courseSchema.index({ isPublished: 1 });

const courseModel = model("course", courseSchema);

export default courseModel;