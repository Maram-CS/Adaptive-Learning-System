import userModel from "../Model/userModel.js";
import Notification from "../Model/notificationModel.js";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
import { render } from "ejs";
config();

const password = process.env.secret;
const  createToken = (id, role)=> {
    return jwt.sign({id, role},password,{expiresIn: "3d"});
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.login(email, password);

    if (user) {

      const token = createToken(user._id, user.role);
      
       res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, 
      });
      // Create a welcome notification for the user upon successful login
      if (user.role === "student") {
        await Notification.create({
          studentId: user._id,
          teacherId: null,
          type: "info",
          title: "Welcome 👋",
          message: "You logged in successfully",
          relatedId: user._id
        });
      }

      //  check role
      if (user.role === "admin") {
  return res.redirect("/App/AdminDashboard");
} else if (user.role === "teacher") {
  return res.redirect("/teacherDashboard/get");
} else if (user.role === "student") {
  return res.redirect("/studentDashboard/");
} else {
  return res.redirect("/login");
}
    }
  } catch (err) {
  console.log("ERROR LOGIN:", err.message);
  res.render("auth/login", { error: err.message });
}
};

export {loginUser};