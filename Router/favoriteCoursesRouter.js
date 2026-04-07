import {Router} from "express";
import { getAllCourses } from "../Controller/favoriteCourseController.js";

const favoriteCoursesRouter = Router();

favoriteCoursesRouter.get("/All", getAllCourses);

export default favoriteCoursesRouter;