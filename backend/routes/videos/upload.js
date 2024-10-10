import express from "express";
import { bucket, db } from "../../config/firebase.js";
import multer from "multer";
import authMiddleware from "../../middleware/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
});

router.post("/upload", authMiddleware, upload.fields([{ name: "video" }, { name: "thumbnail" }]), async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.uid; // Extract from authMiddleware
    let videoUrl, thumbnailUrl;
  
    try {
      // Upload video first, then get the download URL
      if (req.files.video) {
        const videoBlob = bucket.file(`videos/${userId}/${Date.now()}_${req.files.video[0].originalname}`);
        const videoBlobStream = videoBlob.createWriteStream({
          metadata: { contentType: req.files.video[0].mimetype },
        });
  
        // Wait for the stream to finish uploading
        await new Promise((resolve, reject) => {
          videoBlobStream.on('finish', resolve);
          videoBlobStream.on('error', reject);
          videoBlobStream.end(req.files.video[0].buffer);
        });
  
        // Retrieve the video URL
        videoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(videoBlob.name)}?alt=media`;
      }
  
      // Upload thumbnail first, then get the download URL
      if (req.files.thumbnail) {
        const thumbnailBlob = bucket.file(`thumbnails/${userId}/${Date.now()}_${req.files.thumbnail[0].originalname}`);
        const thumbnailBlobStream = thumbnailBlob.createWriteStream({
          metadata: { contentType: req.files.thumbnail[0].mimetype },
        });
  
        // Wait for the stream to finish uploading
        await new Promise((resolve, reject) => {
          thumbnailBlobStream.on('finish', resolve);
          thumbnailBlobStream.on('error', reject);
          thumbnailBlobStream.end(req.files.thumbnail[0].buffer);
        });
  
        // Retrieve the thumbnail URL
        thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(thumbnailBlob.name)}?alt=media`;
      }
  
      // Save video metadata to Firestore
      const videoDoc = await db.collection("videos").add({
        userId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        createdAt: new Date().toISOString(),
        views: 0,
      });
  
      res.status(200).send({ videoId: videoDoc.id, message: "Video uploaded successfully", videoUrl, thumbnailUrl });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).send({ error: "Failed to upload video" });
    }
  });
  
  export default router;