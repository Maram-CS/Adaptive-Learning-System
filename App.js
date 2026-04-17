import RouterLogin from "./Router/userRouter.js";
import AppRouter from "./Router/appRouter.js";
import express from "express";
import { config } from "dotenv";
import { join } from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import profileRouter from "./Router/profileRouter.js";
import cookieParser from "cookie-parser";
import authRequest from "./middleware/authMiddleware.js";
import publicRouter from "./Router/publicRouter.js";
import coursesRouter from "./Router/courseRouter.js";
import teacherDashboardRouter from "./Router/teacherDashBoardRouter.js";
import dashboardRoutes from "./Router/dashboardRoutes.js";
import favoriteCourseRouter from "./Router/favoriteCoursesRouter.js";
import adminRouter from "./Router/AdminRouter.js"; 
import notificationRoutes from "./Router/notificationRoutes.js";
config();

const App = express();
const PORT = process.env.Port || 1000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());
App.use(authRequest);

// ⚠️ Sert le dossier Public/uploads pour les fichiers uploadés
App.use('/uploads', express.static(join(__dirname, 'Public/uploads')));

App.set("view engine", "ejs");
App.set("views", join(__dirname, "views"));
App.use(express.static(join(__dirname, "Public")));

App.use("/auth", RouterLogin);
App.use("/App", authRequest, AppRouter);
App.use("/profile", authRequest, profileRouter);
App.use("/", publicRouter);
App.use("/courses", coursesRouter);
App.use("/teacherDashboard", authRequest, teacherDashboardRouter);
App.use("/studentDashboard", authRequest, dashboardRoutes);
App.use("/favoriteCourses", authRequest, favoriteCourseRouter);
App.use("/api/admin", authRequest, adminRouter);
App.use("/", notificationRoutes);
App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});