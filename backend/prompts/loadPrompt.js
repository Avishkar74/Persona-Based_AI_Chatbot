import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyRootDir = path.resolve(__dirname, "..", "..");

export const loadPrompt = (fileName) => {
  const candidates = [path.join(__dirname, fileName), path.join(legacyRootDir, fileName)];
  const fullPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!fullPath) {
    throw new Error(`Prompt file not found: ${fileName}`);
  }

  let content = fs.readFileSync(fullPath, "utf8").trim();

  if (content.startsWith("`")) {
    content = content.slice(1).trim();
  }

  if (content.endsWith("`,")) {
    content = content.slice(0, -2).trim();
  } else if (content.endsWith("`")) {
    content = content.slice(0, -1).trim();
  }

  return content;
};
