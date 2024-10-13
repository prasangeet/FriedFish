import { Router } from "express";
import { db } from "../config/firebase.js";

const router = Router();

router.get("/:videoId/comments", async (req, res) => {
  const { videoId } = req.params;

  try {
    const commentsRef = db
      .collection("comments")
      .where("videoId", "==", videoId);
    const snapshot = await commentsRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]); // no comments found
    }

    const comments = [];
    snapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });

    // Respond with the comments array
    res.status(200).json(comments);
  } catch (error) {
    console.log("Error fetching comments: ", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
});

router.post("/:videoId/comments", async (req, res) => {
  const { videoId } = req.params;
  const { user, content, userId, profilePicture } = req.body;

  // Make sure both 'user' and 'content' fields are provided
  if (!user || !content || !userId) {
    return res.status(400).json({ error: "User and content are required" });
  }

  try {
    const newComment = {
      videoId,
      user,
      userId,
      content,
      profilePicture,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("comments").add(newComment);
    res.status(201).json({ id: docRef.id, ...newComment });
  } catch (error) {
    console.error("Error posting comment:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to post comment" });
  }
});

router.delete("/:videoId/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const commentRef = db.collection("comments").doc(commentId);
    await commentRef.delete();
    res.status(204).send(); // Successfully deleted
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
