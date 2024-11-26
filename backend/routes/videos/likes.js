import express from "express";
import { db } from "../../config/firebase.js";
import authMiddleware from "../../middleware/auth.js";

const router = express.Router();

// Fetch user reaction (like/dislike) for a video
router.get("/:videoId/reaction", authMiddleware, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.uid;

  try {
    const likesRef = db.collection("likes").doc(videoId);
    const likesDoc = await likesRef.get();

    if (!likesDoc.exists) {
      return res.status(200).send({ liked: false, disliked: false });
    }

    const { likes = [], dislikes = [] } = likesDoc.data();
    res.status(200).send({
      liked: likes.includes(userId),
      disliked: dislikes.includes(userId),
    });
  } catch (error) {
    console.error("Error fetching user reaction:", error);
    res.status(500).send({ error: "Failed to fetch user reaction" });
  }
});

// Add a like to a video
router.post("/:videoId/like", authMiddleware, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.uid;

  try {
    const likesRef = db.collection("likes").doc(videoId);
    const likesDoc = await likesRef.get();

    let likesData = likesDoc.exists
      ? likesDoc.data()
      : { likes: [], dislikes: [] };

    if (likesData.likes.includes(userId)) {
      return res.status(400).send({ error: "You already liked this video" });
    }

    // Add user to likes and remove from dislikes if needed
    likesData.likes.push(userId);
    likesData.dislikes = likesData.dislikes.filter((id) => id !== userId);

    await likesRef.set(likesData);

    // Update the like count in the videos collection
    await db
      .collection("videos")
      .doc(videoId)
      .update({ likes: likesData.likes.length });

    res.status(200).send({ message: "Like added", likes: likesData.likes.length });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(500).send({ error: "Failed to add like" });
  }
});

// Remove a like from a video
router.delete("/:videoId/like", authMiddleware, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.uid;

  try {
    const likesRef = db.collection("likes").doc(videoId);
    const likesDoc = await likesRef.get();

    if (!likesDoc.exists) {
      return res.status(404).send({ error: "No likes found for this video" });
    }

    let likesData = likesDoc.data();
    if (!likesData.likes.includes(userId)) {
      return res.status(400).send({ error: "You haven't liked this video" });
    }

    // Remove user from likes
    likesData.likes = likesData.likes.filter((id) => id !== userId);
    await likesRef.set(likesData);

    // Update the like count in the videos collection
    await db
      .collection("videos")
      .doc(videoId)
      .update({ likes: likesData.likes.length });

    res.status(200).send({ message: "Like removed", likes: likesData.likes.length });
  } catch (error) {
    console.error("Error removing like:", error);
    res.status(500).send({ error: "Failed to remove like" });
  }
});

// Add a dislike to a video
router.post("/:videoId/dislike", authMiddleware, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.uid;

  try {
    const likesRef = db.collection("likes").doc(videoId);
    const likesDoc = await likesRef.get();

    let likesData = likesDoc.exists
      ? likesDoc.data()
      : { likes: [], dislikes: [] };

    if (likesData.dislikes.includes(userId)) {
      return res.status(400).send({ error: "You already disliked this video" });
    }

    // Add user to dislikes and remove from likes if needed
    likesData.dislikes.push(userId);
    likesData.likes = likesData.likes.filter((id) => id !== userId);

    await likesRef.set(likesData);

    // Update the dislike count in the videos collection
    await db
      .collection("videos")
      .doc(videoId)
      .update({ dislikes: likesData.dislikes.length });

    res.status(200).send({
      message: "Dislike added",
      dislikes: likesData.dislikes.length,
    });
  } catch (error) {
    console.error("Error adding dislike:", error);
    res.status(500).send({ error: "Failed to add dislike" });
  }
});

// Remove a dislike from a video
router.delete("/:videoId/dislike", authMiddleware, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.uid;

  try {
    const likesRef = db.collection("likes").doc(videoId);
    const likesDoc = await likesRef.get();

    if (!likesDoc.exists) {
      return res.status(404).send({ error: "No dislikes found for this video" });
    }

    let likesData = likesDoc.data();
    if (!likesData.dislikes.includes(userId)) {
      return res.status(400).send({ error: "You haven't disliked this video" });
    }

    // Remove user from dislikes
    likesData.dislikes = likesData.dislikes.filter((id) => id !== userId);
    await likesRef.set(likesData);

    // Update the dislike count in the videos collection
    await db
      .collection("videos")
      .doc(videoId)
      .update({ dislikes: likesData.dislikes.length });

    res.status(200).send({
      message: "Dislike removed",
      dislikes: likesData.dislikes.length,
    });
  } catch (error) {
    console.error("Error removing dislike:", error);
    res.status(500).send({ error: "Failed to remove dislike" });
  }
});

export default router;
