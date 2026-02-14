import { cpSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = resolve(__dirname, "../node_modules/@pdftron/webviewer/public");
const dest = resolve(__dirname, "../public/lib/webviewer");

if (!existsSync(source)) {
  console.log("WebViewer source not found, skipping copy.");
  process.exit(0);
}

console.log("Copying WebViewer files to public/lib/webviewer...");
cpSync(source, dest, { recursive: true });
console.log("Done.");
