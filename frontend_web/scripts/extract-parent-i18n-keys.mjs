import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/features/parent-dashboard-preview");
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.name.includes("Localization")
      || entry.name === "parentRouteMessages.js"
      || entry.name === "parentNavigation.js"
      || entry.name.startsWith("useParent")
      || entry.name.startsWith("Parent")
    ) {
      files.push(fullPath);
    }
  }
}

walk(root);

const translateKeyRe = /translateKey\(\s*t\s*,\s*["'](parent\.[^"']+)["']\s*,\s*["']([^"']*)["']/g;
const tRe = /t\(["'](parent\.[^"']+)["']\)/g;
const keys = new Map();

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = translateKeyRe.exec(content)) !== null) {
    keys.set(match[1], match[2]);
  }
  while ((match = tRe.exec(content)) !== null) {
    if (!keys.has(match[1])) {
      keys.set(match[1], "");
    }
  }
}

const sorted = Object.fromEntries([...keys.entries()].sort(([a], [b]) => a.localeCompare(b)));
console.log(JSON.stringify(sorted, null, 2));
console.error(`Extracted ${keys.size} keys from ${files.length} files`);
