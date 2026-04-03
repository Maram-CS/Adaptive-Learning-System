import userModel from "../Model/userModel.js";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
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
      // nkhasan user f cookie
      res.cookie("userId", user._id);

      //  check role
      if (user.role === "teacher") {
        return res.redirect("/App/teacherDashboard");
      } else {
        return res.redirect("/App/infoProfile");
      }
    }

  } catch (err) {
  console.log("ERROR LOGIN:", err.message);
  res.send(err.message);
}
};
export {loginUser};