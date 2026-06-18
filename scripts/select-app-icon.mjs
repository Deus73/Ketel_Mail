import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const variantsDir = path.join(root, "assets", "app-icons");
const requested = Number(process.argv[2]);

if (!Number.isInteger(requested) || requested < 1 || requested > 40) {
  console.error("Kies een icoonnummer van 1 t/m 40. Voorbeeld: npm run icon:select -- 17");
  process.exit(1);
}

const padded = String(requested).padStart(2, "0");
const source = path.join(variantsDir, `ketel-mail-icon-${padded}.png`);

if (!fs.existsSync(source)) {
  console.error(`Icoon ${requested} bestaat niet: ${source}`);
  process.exit(1);
}

const pythonScript = `
from PIL import Image
from pathlib import Path
source = Path(r"${source.replaceAll("\\", "\\\\")}")
img = Image.open(source).convert("RGBA")
large = img.resize((1024, 1024), Image.Resampling.LANCZOS)
large.save(Path(r"${path.join(iconsDir, "ketel-mail-icon.png").replaceAll("\\", "\\\\")}"), optimize=True)
large.save(Path(r"${path.join(iconsDir, "ketel-mail-icon-1024.png").replaceAll("\\", "\\\\")}"), optimize=True)
large.save(Path(r"${path.join(iconsDir, "ketel-mail-icon.ico").replaceAll("\\", "\\\\")}"), sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
`;

try {
  execFileSync("python", ["-c", pythonScript], { stdio: "inherit" });
} catch {
  console.error("PNG is gekozen, maar het .ico bestand kon niet opnieuw worden gemaakt. Controleer of Python + Pillow beschikbaar is.");
  process.exit(1);
}

console.log(`Ketel Mail app-icoon ingesteld op variant ${requested}. Bouw daarna opnieuw met: npm run dist:win`);
