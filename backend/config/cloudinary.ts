import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

console.log("Configuring Cloudinary...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not set");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
