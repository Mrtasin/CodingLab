import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import crypto from "crypto";
import mailSender from "../utils/emailSender.js";

const userRegister = asyncHandler(async (req, res) => {
  const { fullname, email, password, gender } = req.body;
  if (!fullname || !email || !password || !gender)
    throw new ApiError(400, "All fields are required");

  const isFound = await User.findOne({ email });
  if (isFound)
    return res
      .status(200)
      .json(new ApiResponse(200, "This email already regesterd", isFound));

  const uname =
    email.split("@")[0] + "-" + crypto.randomBytes(4).toString("hex");

  const newUser = await User.create({
    fullname,
    email,
    password,
    gender,
    username: uname,
  });
  if (!newUser) throw new ApiError(500, "Internel Server Error");

  const token = newUser.createEmailVerificationToken();

  if (!token) throw new ApiError(500, "Internel Server Error");

  await newUser.save();

  newUser.password = undefined;

  const option = {
    name: fullname,
    email: email,
    subject: "Email Verification",
    instructions: `Click on the link below to verify your email address:`,
    link: `${process.env.BASE_URL}/api/v1/users/verify/${token}`,
  };

  await mailSender(option);

  return res
    .status(201)
    .json(new ApiResponse(201, "User register successfully", newUser));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) throw new ApiError(401, "Token is Required");

  const user = await User.findOne({
    verificationToken: token,
    verificationExpiry: { $gte: Date.now() },
  }).select("-password");

  if (!user) throw new ApiError(401, "Token is Expired");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Email verified successfully", user));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, "All fields are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Password is incorrect");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  user.password = undefined;

  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  };

  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };

  return res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, "User logged in successfully", user));
});

export { userRegister, verifyEmail, userLogin };
