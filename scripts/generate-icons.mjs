import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

function svg(size) {
  const radius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.28);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#22c55e"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-weight="700" font-size="${fontSize}">POS</text>
    </svg>`,
  );
}

await sharp(svg(192)).png().toFile(path.join(iconsDir, "icon-192.png"));
await sharp(svg(512)).png().toFile(path.join(iconsDir, "icon-512.png"));
console.log("PWA icons generated in public/icons/");
