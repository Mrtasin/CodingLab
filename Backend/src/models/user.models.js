import { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      default: "https://placehold.co/600x400/orange/white",
    },
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    fullname: {
      type: String,
      required: true,
      min: 3,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: String,
    verificationExpiry: Date,

    emailVerificationToken: String,
    emailVerificationExpiry: Date,

    refreshToken: String,
  },
  { timestamps: true },
);

userSchema.pre("save", function (next) {
  if (this.isModified("password"))
    this.password = bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = Model("User", userSchema);

export default User;
