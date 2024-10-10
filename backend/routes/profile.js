import express from "express";
import { admin, db, bucket } from "../config/firebase.js"; // Import bucket from your firebase.js
import multer from "multer";
import authMiddleware from "../middleware/auth.js"; // Ensure you have this middleware
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
});

// Get user Profile
router.get("/:uid", authMiddleware, async (req, res) => {
  // Added authMiddleware
  const { uid } = req.params;

  try {
    const userRecord = await admin.auth().getUser(uid);
    const userProfile = await db.collection("users").doc(uid).get();

    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      ...userProfile.data(),
    };

    res.status(200).send(userData);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Update User Profile
// Update User Profile
router.put(
  "/:uid",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    const { uid } = req.params;
    const { displayName } = req.body;

    try {
      // Upload file to Firebase Storage if provided
      let profilePictureUrl = null;
      if (req.file) {
        const blob = bucket.file(
          `profilePictures/${uid}/${Date.now()}_${req.file.originalname}`
        );
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        // Handle stream events
        await new Promise((resolve, reject) => {
          blobStream.on("error", (error) => {
            console.error("Error uploading file:", error);
            reject(new Error("Failed to upload profile picture"));
          });

          blobStream.on("finish", () => {
            profilePictureUrl = `https://firebasestorage.googleapis.com/v0/b/${
              bucket.name
            }/o/${encodeURIComponent(blob.name)}?alt=media`;
            resolve();
          });

          blobStream.end(req.file.buffer);
        });
      }

      // Update Firestore with new data
      await db.collection("users").doc(uid).set(
        {
          displayName,
          profilePicture: profilePictureUrl, // This will be null if no file was uploaded
        },
        { merge: true }
      );

      // Fetch the updated user data
      const updatedUserDoc = await db.collection("users").doc(uid).get();
      const updatedUserData = {
        uid,
        email: (await admin.auth().getUser(uid)).email,
        ...updatedUserDoc.data(),
      };

      console.log("Profile updated successfully:", updatedUserData);
      res.status(200).send(updatedUserData);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).send({ error: error.message });
    }
  }
);

export default router;
