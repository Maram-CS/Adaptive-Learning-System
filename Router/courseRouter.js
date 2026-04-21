import {Router} from "express";
import {
    getAllCourses, getCourseBySlug, createCourse, editCourse, deleteCourse,
    getCourseLessonsPage, getCourseBySlugForStudent, getEditCoursePage,
    getLessonsByLevel, getCourseLearnPage, completeLesson,
    submitPlacementQuiz, saveQuiz, deleteQuiz , getLevelQuiz, getLevelLessons
} from "../Controller/courseController.js";
import authRequest from "../middleware/authMiddleware.js";
import { roleRequest } from "../middleware/roleMiddleware.js";
import { upload } from "../ConfigDB/multerConfig.js";

const coursesRouter = Router();

const courseUpload = upload.fields([
    { name: "image",       maxCount: 1  },
    { name: "lessonFiles", maxCount: 50 }
]);

// ── Public ─────────────────────────────────────────────────────────────────────
coursesRouter.get("/All", getAllCourses);
coursesRouter.get("/getCourse/:slug", getCourseBySlug);

// ── Instructor ─────────────────────────────────────────────────────────────────
coursesRouter.post("/create",       authRequest, roleRequest, courseUpload, createCourse);
coursesRouter.post("/edit/:slug",   authRequest, roleRequest, courseUpload, editCourse);
coursesRouter.post("/delete/:slug", authRequest, roleRequest, deleteCourse);

// Teacher: lesson management page
coursesRouter.get("/content/:slug", authRequest, roleRequest, getCourseLessonsPage);
coursesRouter.get("/edit/:slug",    authRequest, roleRequest, getEditCoursePage);

// Teacher: quiz CRUD
coursesRouter.post("/content/:slug/quiz/save",         authRequest, roleRequest, saveQuiz);
coursesRouter.delete("/content/:slug/quiz/:quizId",    authRequest, roleRequest, deleteQuiz);

// ── Student ─────────────────────────────────────────────────────────────────────
// "View Details" on courses.ejs → lands here → shows placement quiz (or redirects to /learn)
coursesRouter.get("/course/:slug",        authRequest, getCourseBySlugForStudent);
coursesRouter.get("/course/:slug/learn",  authRequest, getCourseLearnPage);

// Lesson level filter (legacy)
coursesRouter.get("/:courseId/lessons/:level", getLessonsByLevel);

// ── API endpoints (called via fetch) ───────────────────────────────────────────
coursesRouter.post("/api/complete-lesson",        authRequest, completeLesson);
coursesRouter.post("/api/submit-quiz",  authRequest, submitPlacementQuiz);

coursesRouter.get("/api/level-quiz",    authRequest, getLevelQuiz);

// Returns the lessons for a given level (and the student's completed lesson IDs)
coursesRouter.get("/api/level-lessons", authRequest, getLevelLessons);

export default coursesRouter;