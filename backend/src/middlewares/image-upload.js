import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinaryConfig.js";
import { getText } from "../utils/index.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

export default (req, res, next) => {
  // Use multer to handle file upload

  upload(req, res, (err) => {
    console.log(err)
    if (err) {
      return res.status(500).json({
        resultMessage: getText("00090"), // "File upload error."
        resultCode: "00090",
        error: err.message,
      });
    }


    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        resultMessage: getText("00022"), // "No file uploaded."
        resultCode: "00022",
      });
    }

    // Upload the file to Cloudinary
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({
            resultMessage: getText("00090"), // "Cloudinary upload error."
            resultCode: "00090",
            error: error.message,
          });
        }

        // Save the Cloudinary URL in request object
        req.imageUrl = result.secure_url;
        next(); // Proceed to the next middleware or controller
      }
    );

    // Convert buffer to stream and upload to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });
};
