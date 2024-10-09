import express from "express";
import { admin } from "../config/firebase.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

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
    const user = await admin.auth().getUserByEmail(email);
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).send({ uid: user.uid, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default router;
