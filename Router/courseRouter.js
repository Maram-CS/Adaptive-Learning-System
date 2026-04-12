import { getAllCourses , getCourseBySlug , createCourse , editCourse , deleteCourse } from "../Controller/courseController.js";
import authRequest from "../middleware/authMiddleware.js";
import {roleRequest} from "../middleware/roleMiddleware.js";
import { upload } from "../ConfigDB/multerConfig.js";
import Router from "express";

const coursesRouter = Router();

coursesRouter.get("/getCourse/:slug/",getCourseBySlug);
coursesRouter.get("/All",getAllCourses);
coursesRouter.post("/create",authRequest,roleRequest, upload.single("image"),createCourse);
coursesRouter.post("/edit/:slug/",authRequest,roleRequest,upload.single("image"),editCourse);
coursesRouter.post("/delete/:slug/",authRequest,roleRequest,deleteCourse);

export default  coursesRouter;