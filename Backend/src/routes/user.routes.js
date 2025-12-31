import { Router } from "express";
import { userRegister } from "../controllers/user.controllers.js";

const userRoutes = Router();

userRoutes.route("/register").post(userRegister);

export default userRoutes;
