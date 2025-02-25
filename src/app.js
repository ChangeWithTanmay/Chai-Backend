import express from "express";
import corse from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  corse({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.router.js";
import videoRouter from "./routes/video.router.js";
import playlistRouter from "./routes/playlist.router.js";
import tweetRouter from "./routes/tweet.router.js";
import commentRouter from "./routes/comment.router.js";
import likeRouter from "./routes/like.router.js";
import patientRouter from "./saas/routers/patient.router.js"

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/patient", patientRouter);

// http://localhost:5000/api/v1/users/register

export default app;
