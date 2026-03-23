import RouterLogin from "./Router/userRouter.js";
import AppRouter from "./Router/appRouter.js";
import express from "express";
import { config } from "dotenv";
import { join, dirname } from "path";
import profileRouter from "./Router/profileRouter.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRequest from "./middleware/authMiddleware.js";
config();

const App = express();
const PORT = process.env.Port || 1000;

const __dirname = import.meta.dirname;

App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());
App.use('/uploads', express.static('uploads'));

App.use("/auth", RouterLogin);
App.use("/App", authRequest, AppRouter);
App.use("/profile", authRequest, profileRouter);

App.set("view engine", "ejs");
App.set("views", join(__dirname, "view"));
App.use(express.static(join(__dirname, "Public")));

App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
