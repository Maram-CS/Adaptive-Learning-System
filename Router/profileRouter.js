import {Router} from "express";
import {getProfile,createProfile} from "../Controller/profileController.js";
import { upload } from "../ConfigDB/multerConfig.js";
const profileRouter = Router();
profileRouter.post("/create", upload.single("profilePicture"), createProfile);
profileRouter.get("/profileInfo/:email", getProfile);

export default profileRouter;