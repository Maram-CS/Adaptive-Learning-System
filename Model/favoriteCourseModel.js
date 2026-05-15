import { Schema, model } from "mongoose";

const favoriteCourseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates per user
favoriteCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const favoriteCourseModel = model(
  "FavoriteCourse",
  favoriteCourseSchema
);

export default favoriteCourseModel;

