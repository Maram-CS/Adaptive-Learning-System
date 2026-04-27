import userModel from "../Model/userModel.js";
import Notification from "../Model/notificationModel.js";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
import { render } from "ejs";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

      // notification t3 create
      if (user.role === "student") {
        await Notification.create({
          studentId: user._id,
          type: "info",
          title: "Welcome 👋",
          message: "You logged in successfully",
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
//  forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

   res.redirect(`/reset-password/${token}`);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password; // hashing already done in pre("save")
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    // 🔔 notification
  await Notification.create({
  studentId: user._id,
  type: "info",
  title: "Password changed 🔐",
  message: "Your password has been updated successfully"
});

      res.redirect("/login?reset=success");

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {loginUser, forgotPassword, resetPassword };