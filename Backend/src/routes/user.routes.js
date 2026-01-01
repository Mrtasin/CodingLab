import { Router } from "express";
import {
  userRegister,
  verifyEmail,
  userLogin,
} from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.route("/register").post(userRegister);
userRoutes.route("/verify/:token").post(verifyEmail);
userRoutes.route("/login").post(userLogin);

export default userRoutes;
