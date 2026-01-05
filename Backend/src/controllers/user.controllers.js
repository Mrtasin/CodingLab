import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import crypto from "crypto";
import mailSender from "../utils/emailSender.js";
import fileUploadOnCloudinary from "../utils/cloudinary.js";

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

const userLogout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) throw new ApiError(401, "User not loggedIn");

  const user = await User.findOne({ refreshToken }).select("-password");
  if (!user) throw new ApiError(401, "User not loggedIn");

  user.refreshToken = undefined;
  await user.save();
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", user));
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "User Not LoggedIn");

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError("401", "Invalid Session");

  return res
    .status(200)
    .json(new ApiResponse(200, "Fatching Profile Successfully", user));
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "User Not LoggedIn");

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError("401", "Invalid Session");
  console.log(req.file);
  const avatar = req.file;
  if (!avatar) throw new ApiError(400, "Avatar is required");

  const response = await fileUploadOnCloudinary(avatar.path);

  if (response == null) throw new ApiError(401, "Error for uploding file");

  user.avatar = response;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Uploding Profile Picture Successfully", user));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email Id is required");

  const user = await User.findOne({ email });
  if (!user)
    throw new ApiError(404, "Not Found User").select("-password -refreshToken");

  const token = user.createResetVerificationToken();

  const option = {
    name: user.fullname,
    email: user.email,
    subject: "Reset Password",
    instructions: `Click on the link below to Reset your account password:`,
    link: `${process.env.BASE_URL}/api/v1/users/reset-password/${token}`,
  };

  await mailSender(option);

  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Send Email Successfully for reset password", user),
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) throw new ApiError(400, "Token is required");

  const { password } = req.body;
  if (!password) throw new ApiError(400, "Password is required");

  const user = await User.findOne({
    resetVerificationToken: token,
    resetVerificationExpiry: { $gte: Date.now() },
  });
  if (!user) throw new ApiError(401, "Token is invalid and loss session");

  if (user.comparePassword(password))
    throw new ApiError(
      401,
      "This password already set, Use Different password",
    );

  user.password = password;
  user.resetVerificationExpiry = undefined;
  user.resetVerificationToken = undefined;
  user.refreshToken = undefined;

  await user.save();

  user.password = undefined;

  return res
    .status(200)
    .json(new ApiResponse(200, " Password Reset Successfully", user));
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "User Not LoggedIn");

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(400, "All fields are required");

  if (oldPassword === newPassword)
    throw new ApiError(400, "New password must be different from old password");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, "Invalid Session");

  if (!user.comparePassword(oldPassword))
    throw new ApiError(401, "Password is incorrect");

  user.password = newPassword;
  await user.save();

  user.password = undefined;
  user.refreshToken = undefined;

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Change Successfully", user));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) throw new ApiError(401, "User Not LoggedIn");

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "Invalid Session");

  if (user.isVerified) throw new ApiError(401, "Email is already verified");

  const token = user.createEmailVerificationToken();

  const option = {
    name: user.fullname,
    email: user.email,
    subject: "Email Verification",
    instructions: `Click on the link below to verify your account:`,
    link: `${process.env.BASE_URL}/api/v1/users/verify/${token}`,
  };

  await mailSender(option);

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Send Email Successfully", user));
});

export {
  userRegister,
  verifyEmail,
  userLogin,
  userLogout,
  getProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
};
