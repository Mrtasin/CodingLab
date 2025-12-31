import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

    resetVerificationToken: String,
    resetVerificationExpiry: Date,

    refreshToken: String,
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = verificationToken;
  this.verificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  return verificationToken;
};

const User = model("User", userSchema);

export default User;
