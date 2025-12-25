import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Mongodb connected");
  } catch (err) {
    console.error("Mongodb connection fail", err.message);
    process.exit(0);
  }
};

export default connectDb;
