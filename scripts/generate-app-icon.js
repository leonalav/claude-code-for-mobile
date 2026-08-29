/**
 * Generate the Claude Code circular app icon (1024×1024) from the
 * existing claude-mark.png source.
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "images", "claude-mark.png");
const OUT_DIR = path.join(
  ROOT,
  "ios",
  "App",
  "App",
  "Assets.xcassets",
  "AppIcon.appiconset",
);
const OUT = path.join(OUT_DIR, "AppIcon-512@2x.png");

const SIZE = 1024;
const BG = "#D97757";
const RADIUS = SIZE / 2;

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error(`Missing source: ${SRC}`);
    process.exit(1);
  }

  const mark = await sharp(SRC).resize(640, 640, { fit: "inside" }).png().toBuffer();

  const svgMask = Buffer.from(`
    <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${RADIUS}" cy="${RADIUS}" r="${RADIUS}" fill="${BG}" />
    </svg>
  `);

  await sharp(svgMask)
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(OUT);

  console.log(`Wrote ${OUT}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});