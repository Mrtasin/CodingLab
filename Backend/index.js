import app from "./src/app.js";
import dotenv from "dotenv";
import connectDb from "./src/connectionDB/connectDB.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;

await connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on port : ", port);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err.message);
  });
