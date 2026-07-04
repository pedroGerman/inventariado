import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

function svg(size) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.34);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/>
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${radius - 2}" fill="none" stroke="#22c55e" stroke-width="3"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}" letter-spacing="1">INV</text>
    </svg>`,
  );
}

await sharp(svg(192)).png().toFile(path.join(iconsDir, "icon-192.png"));
await sharp(svg(512)).png().toFile(path.join(iconsDir, "icon-512.png"));
console.log("PWA icons generated in public/icons/");
