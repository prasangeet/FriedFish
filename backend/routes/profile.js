import express from "express";
import { admin } from "../config/firebase.js";
import { db } from "../config/firebase.js";

const router = express.Router();

// Get user Profile
router.get("/:uid", async (req, res) => {
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

//Update User Profile
router.put("/:uid", async (req, res) => {
  const { uid } = req.params;
  const { displayName, profilePicture } = req.body;

  try {
    await db.collection("users").doc(uid).set(
      {
        displayName,
        profilePicture,
      },
      { merge: true }
    );

    res.status(200).send({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default router;
