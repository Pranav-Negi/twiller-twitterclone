const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_key,
  api_secret: process.env.cloud_sceret,
});

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/uploadvideo", upload.single("video"), async (req, res) => {
  try {
    console.log("Received file:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No video file received" });
    }

    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video", 
    });

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
});

module.exports = router;
