import { v2 as cloudinary } from "cloudinary";
import ApiError from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      public_id: Date.now(),
    });

    return result.secure_url;
  } catch (err) {
    throw new ApiError(500, "Cloudinary Upload Error: " + err.message);
  }
};

export default fileUploadOnCloudinary;
