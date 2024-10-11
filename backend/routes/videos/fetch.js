import express from "express";
import { db } from "../../config/firebase.js";

const router = express.Router();

// Fetch a list of videos
router.get("/", async (req, res) => {
  try {
    const videosSnapshot = await db
      .collection("videos")
      .orderBy("createdAt", "desc")
      .get();
    const videos = videosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch videos" });
  }
});

// Fetch a specific video by ID
router.get("/:videoId", async (req, res) => {
  const { videoId } = req.params;

  try {
    const videoDoc = await db.collection("videos").doc(videoId).get();
    if (!videoDoc.exists) {
      return res.status(404).send({ error: "Video not found" });
    }

    res.status(200).send({ id: videoDoc.id, ...videoDoc.data() });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch video" });
  }
});

export default router;
