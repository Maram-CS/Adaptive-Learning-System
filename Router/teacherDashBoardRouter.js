import {Router} from "express";
import authRequest from "../middleware/authMiddleware.js";
import courseModel from "../Model/courseModel.js";
import { getTeacherDashboard , createQuiz ,getSelectCourseForQuizPage} from "../Controller/teacherDashBoardController.js";

const teacherDashboardRouter = Router();

teacherDashboardRouter.get("/get", authRequest, getTeacherDashboard);

teacherDashboardRouter.post("/createQuiz", authRequest, createQuiz);

teacherDashboardRouter.get("/selectCourseForQuiz", authRequest, async (req, res) => {

        const courses = await courseModel.find({ Instructor: req.id });

        res.render("auth/selectCourseQuiz", { courses });

});

teacherDashboardRouter.get("/createQuiz/:courseId", authRequest, getSelectCourseForQuizPage);

export default teacherDashboardRouter;