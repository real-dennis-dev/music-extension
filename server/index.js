

import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());

const MEDIA_DIR = "C:/Users/YOUR_NAME/Music"; // change this

// Get all media files
app.get("/api/files", (req, res) => {
  fs.readdir(MEDIA_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const mediaFiles = files.filter(file =>
      file.endsWith(".mp3") ||
      file.endsWith(".mp4") ||
      file.endsWith(".wav")
    );

    res.json(mediaFiles);
  });
});

// Stream file
app.get("/api/play/:name", (req, res) => {
  const filePath = path.join(MEDIA_DIR, req.params.name);
  res.sendFile(filePath);
});

app.listen(5000, () => console.log("Server running on port 5000"));