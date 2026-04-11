import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { parseFile } from "music-metadata";

const app = express();
app.use(cors());

let CURRENT_DIR = "C:/Users/Administrator/Downloads/DJ-Video-Mixes";
// 📂 recursive scan
async function scanDir(dir) {
  let results = [];

  const list = fs.readdirSync(dir);

  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results = results.concat(await scanDir(full));
    } else if (/\.(mp3|wav|flac|mp4|mkv)$/i.test(file)) {
      results.push(full);
    }
  }

  return results;
}

// 🎵 metadata
async function enrich(file) {
  try {
    const meta = await parseFile(file);

    return {
      path: file,
      title: meta.common.title || path.basename(file),
      artist: meta.common.artist || "Unknown",
      album: meta.common.album || "Unknown",
      picture: meta.common.picture?.[0]?.data?.toString("base64"),
      type: /\.(mp4|mkv)$/i.test(file) ? "video" : "audio"
    };
  } catch {
    return { path: file, title: path.basename(file), type: "audio" };
  }
}

// 📡 scan endpoint
app.get("/scan", async (req, res) => {
  const dir = req.query.dir;

  if (!dir) return res.status(400).send("No dir");

  CURRENT_DIR = dir;

  const files = await scanDir(dir);
  const enriched = await Promise.all(files.map(enrich));

  res.json(enriched);
});

// ▶️ stream
app.get("/media", (req, res) => {
  const file = req.query.path;
  fs.createReadStream(file).pipe(res);
});

app.listen(3001, () => console.log("Server running"));