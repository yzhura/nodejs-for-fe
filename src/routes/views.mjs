import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/", (req, res) => {
  console.log("__dirname: ", __dirname);
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

export default router;
