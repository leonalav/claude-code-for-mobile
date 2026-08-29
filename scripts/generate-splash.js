/**
 * Generate the splash screen — solid #141413 background with a centered
 * Claude mark, sized to all common iOS splash sizes.
 */

import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "public", "images", "claude-mark.png");
const SPLASH_DIR = path.join(
  ROOT,
  "ios",
  "App",
  "App",
  "Assets.xcassets",
  "Splash.imageset",
);
fs.mkdirSync(SPLASH_DIR, { recursive: true });

const BG = "#141413";
const SIZES = [
  { name: "splash-2732x2732.png", size: 2732 }, // iPad Pro 12.9" portrait
  { name: "splash-2048x2048.png", size: 2048 }, // iPad Pro 11"
  { name: "splash-1668x2388.png", size: 2388 }, // iPad Pro 11" portrait (use longest side)
  { name: "splash-1170x2532.png", size: 2532 }, // iPhone 14 Pro Max
  { name: "splash-1242x2688.png", size: 2688 }, // iPhone 13 Pro Max
  { name: "splash-828x1792.png", size: 1792 },  // iPhone 11
  { name: "splash-750x1334.png", size: 1334 },  // iPhone 8
];

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error(`Missing source: ${SRC}`);
    process.exit(1);
  }

  const markBuf = await sharp(SRC).resize(420, 420, { fit: "inside" }).png().toBuffer();

  for (const { name, size } of SIZES) {
    const svg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${BG}" />
      </svg>
    `);
    const out = path.join(SPLASH_DIR, name);
    await sharp(svg)
      .composite([{ input: markBuf, gravity: "center" }])
      .png()
      .toFile(out);
    console.log(`Wrote ${out}`);
  }

  // Default splash.png (used by Capacitor splash plugin)
  const defaultOut = path.join(SPLASH_DIR, "splash.png");
  const defaultSize = 2732;
  const defaultSvg = Buffer.from(`
    <svg width="${defaultSize}" height="${defaultSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${defaultSize}" height="${defaultSize}" fill="${BG}" />
    </svg>
  `);
  await sharp(defaultSvg)
    .composite([{ input: markBuf, gravity: "center" }])
    .png()
    .toFile(defaultOut);
  console.log(`Wrote ${defaultOut}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});