import express from "express";
import { admin, auth, db } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        displayName: displayName || "",
        profilePicture: "", // Default or empty
      });

    res.status(201).send({ uid: userRecord.uid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verify user credentials using Firebase REST API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const user = response.data;

    // Fetch user details from Firestore
    const userDoc = await db.collection("users").doc(user.localId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    const userData = userDoc.data();
    const token = jwt.sign({ uid: user.localId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send back the uid, displayName, and token
    res.status(200).send({
      uid: user.localId,
      displayName: userData.displayName || "", // Get the displayName from Firestore
      token,
    });
  } catch (error) {
    res
      .status(400)
      .send({ error: error.response?.data?.error?.message || error.message });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  // Here you can perform any necessary actions, like logging out the user in your database, etc.
  res.status(200).send({ message: "Logout successful" });
});

export default router;
