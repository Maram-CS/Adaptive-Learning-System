import RouterLogin from "./Router/loginRouter.js";
import AppRouter from "./Router/appRouter.js";
import express from "express";
import {config} from "dotenv";
import {join} from "path";
import ejs from "ejs";
config();

const App = express();
const PORT = process.env.Port || 1000;
const dirname = import.meta.dirname;

App.use(express.json());
App.use(express.urlencoded({extended : true}));

App.use("/login", RouterLogin);
App.use("/App", AppRouter);

App.set("view engine", "ejs");
App.set("views", join(dirname, "/view"));
App.use(express.static(join(dirname, "/Public")));

App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
