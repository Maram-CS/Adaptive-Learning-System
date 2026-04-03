import { getAllCourses , getCourseBySlug , createCourse , editCourse , deleteCourse } from "../Controller/courseController.js";
import authRequest from "../middleware/authMiddleware.js";
import {roleRequest} from "../middleware/roleMiddleware.js";
import Router from "express";

const coursesRouter = Router();

coursesRouter.get("/getCourse/:slug/",getCourseBySlug);
coursesRouter.get("/All",getAllCourses);
coursesRouter.post("/create",authRequest,roleRequest,createCourse);
coursesRouter.put("/edit/:slug/",authRequest,roleRequest,editCourse);
coursesRouter.delete("/delete/:slug/",authRequest,roleRequest,deleteCourse);

export default  coursesRouter;