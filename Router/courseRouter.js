import Router from "express";
import { getAllCourses, getCourseBySlug, createCourse,editCourse, deleteCourse, getCourseLessonsPage,getCourseBySlugForStudent,getEditCoursePage}from "../Controller/courseController.js";
import authRequest from "../middleware/authMiddleware.js";
import { roleRequest }from "../middleware/roleMiddleware.js";
import { upload }from "../ConfigDB/multerConfig.js";

const coursesRouter = Router();

const courseUpload = upload.fields([ { name: "image",       maxCount: 1  }, { name: "lessonFiles", maxCount: 50 }
]);

// Public routes
coursesRouter.get("/All",getAllCourses);
coursesRouter.get("/getCourse/:slug",getCourseBySlug);

// Protected routes (instructor only)
coursesRouter.post( "/create",authRequest, roleRequest,courseUpload, createCourse
);

coursesRouter.post("/edit/:slug",authRequest,roleRequest,courseUpload,editCourse
);

coursesRouter.post("/delete/:slug",authRequest, roleRequest, deleteCourse);

//get lessons page for teacher
coursesRouter.get("/content/:slug", authRequest, roleRequest, getCourseLessonsPage);

//get course page for student
coursesRouter.get("/course/:slug",authRequest, getCourseBySlugForStudent);

coursesRouter.get("/edit/:slug",authRequest,roleRequest,getEditCoursePage);

export default coursesRouter;