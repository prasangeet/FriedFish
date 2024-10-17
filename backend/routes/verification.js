import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(400).json({ message: "Token not provided." });
  }

  try {
    // Verify token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res
      .status(200)
      .json({ valid: true, userId: decoded.id, expiresIn: decoded.exp });
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
});

export default router;
