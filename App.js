import RouterLogin from "./Router/userRouter.js";
import AppRouter from "./Router/appRouter.js";
import express from "express";
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
config();

const App = express();
const PORT = process.env.Port || 1000;

const __dirname = import.meta.dirname;

App.use(express.json());
App.use(express.urlencoded({ extended: true }));

App.use("/auth", RouterLogin);
App.use("/App", AppRouter);

App.set("view engine", "ejs");
App.set("views", join(__dirname, "view"));
App.use(express.static(join(__dirname, "Public")));

App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});