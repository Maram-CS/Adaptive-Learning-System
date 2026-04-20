import express from 'express';
import authRequest from '../middleware/authMiddleware.js';
import { getStudentDashboardData ,getStudentDashboard , getLeaderboardData , studentCourseLessons } from '../Controller/studentDashboardController.js';

const studentDashboardRouter = express.Router();

studentDashboardRouter.get('/get', authRequest, getStudentDashboardData);

studentDashboardRouter.get('/leaderboard', authRequest, getLeaderboardData);

studentDashboardRouter.get('/', authRequest, getStudentDashboard);

studentDashboardRouter.get("/course/:courseId",authRequest,studentCourseLessons);

   

export default studentDashboardRouter;