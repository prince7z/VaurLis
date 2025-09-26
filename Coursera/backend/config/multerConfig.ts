import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "user-images", // Main folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  }),
});

const upload = multer({ storage });

export default upload;
