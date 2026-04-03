import { Schema, model } from "mongoose";
import slugify from "slugify"; // npm install slugify
import userModel from "./userModel.js";

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
        ref: "User",
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

    // ⭐ Average Rating
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

    chapters: [chapterSchema],
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
}

}, { timestamps: true });


//Calculate Average Rating Automatically
courseSchema.pre("save", function () {
    if (this.rating.length === 0) {
        this.averageRating = 0;
    } else {
        const total = this.rating.reduce(
            (acc, item) => acc + item.value,
            0
        );

        this.averageRating = total / this.rating.length;
    }

});

courseSchema.pre("save", function(){
    if(!this.slug){
        this.slug = slugify(this.Title, { lower: true, strict: true });
    }
    
});


//for better query performance
courseSchema.index({ Title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ Instructor: 1 });
courseSchema.index({ isPublished: 1 });

const courseModel = model("course", courseSchema);
export default courseModel;