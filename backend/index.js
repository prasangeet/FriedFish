import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js'
import authMiddleware from './middleware/auth.js';
import profileRoutes from './routes/profile.js'
import videoUploadRoutes from "./routes/videos/upload.js";
import videoFetchRoutes from "./routes/videos/fetch.js";
import commentRoutes from "./routes/commentRoutes.js"

dotenv.config();

const app = express();

app.use(cors({
  origin: '*', // Change back after debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FriedFish Backend is running!");
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use("/api/videos", videoUploadRoutes);
app.use("/api/videos", videoFetchRoutes);
app.use("/api/videos", commentRoutes);

//protectedRoute
app.get('/api/protected', authMiddleware, (req, res) => {
  res.send({ message: 'This is a protected route', uid: req.user.uid });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
