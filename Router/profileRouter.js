import {Router} from "express";
import {createProfile} from "../Controller/profileController.js";
import { upload } from "../ConfigDB/multerConfig.js";
const profileRouter = Router();
profileRouter.post("/create", upload.single("profilePicture"), createProfile);

export default profileRouter;