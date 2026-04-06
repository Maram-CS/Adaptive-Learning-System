import RouterLogin from "./Router/userRouter.js";
import AppRouter from "./Router/appRouter.js";
import express from "express";
import { config } from "dotenv";
import { join } from "path";
import profileRouter from "./Router/profileRouter.js";
import cookieParser from "cookie-parser";
import authRequest from "./middleware/authMiddleware.js";
import publicRouter from "./Router/publicRouter.js";
import coursesRouter from "./Router/courseRouter.js";
import teacherDashboardRouter from "./Router/teacherDashBoardRouter.js";
import dashboardRoutes from "./Router/dashboardRoutes.js";
import studentDashboardRouter from "./Router/dashboardRoutes.js";

config();

const App = express();
const PORT = process.env.Port || 1000;

const __dirname = import.meta.dirname;

App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());
App.use('/uploads', express.static('uploads'));



App.set("view engine", "ejs");
App.set("views", join(__dirname, "views"));
App.use(express.static(join(__dirname, "Public")));         




App.use("/auth", RouterLogin);
App.use("/App",authRequest,AppRouter);
App.use("/profile", authRequest, profileRouter);
App.use("/", publicRouter);
App.use("/courses", coursesRouter);
App.use("/teacherDashboard", authRequest, teacherDashboardRouter);
App.use("/api/dashboard", authRequest, dashboardRoutes);
App.use("/studentDashboard", authRequest, studentDashboardRouter);

App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 