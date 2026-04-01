import { getAllCourses , getCourseByTitle , createCourse , editCourse , deleteCourse } from "../Controller/courseController.js";
import Router from "express";
import {roleRequest} from "../middleware/roleMiddleware.js";

const coursesRouter = Router();

coursesRouter.get("/getCourse",getCourseByTitle);
coursesRouter.get("/All",getAllCourses);
coursesRouter.post("create",roleRequest,createCourse);
coursesRouter.post("/edit",roleRequest,editCourse);
coursesRouter.delete("/delete",roleRequest,deleteCourse);

export default  coursesRouter;