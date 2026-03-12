import {Router} from "express";
import {createProfile,editProfile} from "../Controller/profileController.js";
import { upload } from "../ConfigDB/multerConfig.js";
import { profile } from "console";
const profileRouter = Router();
profileRouter.post("/create", upload.single("profilePicture"), createProfile);
profileRouter.post("/edit", upload.single("profilePicture"), editProfile);

export default profileRouter;