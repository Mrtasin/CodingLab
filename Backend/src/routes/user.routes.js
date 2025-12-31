import { Router } from "express";
import { userRegister, verifyEmail } from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.route("/register").post(userRegister);
userRoutes.route("/verify/:token").post(verifyEmail);

export default userRoutes;
