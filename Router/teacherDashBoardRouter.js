import {Router} from "express";
import authRequest from "../middleware/authMiddleware.js";
import { getTeacherDashboard } from "../Controller/teacherDashBoardController.js";

const teacherDashboardRouter = Router();

teacherDashboardRouter.get("/get", authRequest, getTeacherDashboard);

export default teacherDashboardRouter;