import { Router } from "express";
import {
  userRegister,
  verifyEmail,
  userLogin,
  userLogout,
  getProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/user.controllers.js";
import isLoggedIn from "../middlewares/auth.middlewares.js";
import upload from "../middlewares/multer.middlewares.js";

const userRoutes = Router();

userRoutes.route("/register").post(userRegister);
userRoutes.route("/verify/:token").post(verifyEmail);
userRoutes.route("/login").post(userLogin);
userRoutes.route("/logout").get(isLoggedIn, userLogout);
userRoutes.route("/me").get(isLoggedIn, getProfile);
userRoutes.route("/forgot-password").post(forgotPassword);
userRoutes.route("/reset-password/:token").post(resetPassword);
userRoutes.route("/change-password").post(isLoggedIn, changePassword);
userRoutes
  .route("/profile-picture")
  .post(isLoggedIn, upload.single("avatar"), uploadAvatar);

export default userRoutes;
