import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); // Debugging

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(403).send({ error: "Token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err); // Debugging
      return res.status(401).send({ error: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};


export default authMiddleware;
