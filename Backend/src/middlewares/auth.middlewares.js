import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) throw new ApiError(401, "User not loggedIn");

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) throw new ApiError(401, "User not loggedIn");

    req.user = decoded;
    next();
  } catch (err) {
    next(err.message);
  }
};

export default isLoggedIn;
