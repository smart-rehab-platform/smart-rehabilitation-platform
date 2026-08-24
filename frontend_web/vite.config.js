import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const generatedSwPath = path.join(rootDir, ".generated", "firebase-messaging-sw.js");

/**
 * During `vite`/`predev`, serve the injected SW from `.generated/` when present
 * so `public/firebase-messaging-sw.js` can stay as a placeholder template.
 */
function serveGeneratedFirebaseSw() {
  return {
    name: "serve-generated-firebase-sw",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || "").split("?")[0];
        if (urlPath !== "/firebase-messaging-sw.js") {
          next();
          return;
        }

        if (!fs.existsSync(generatedSwPath)) {
          next();
          return;
        }

        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.end(fs.readFileSync(generatedSwPath));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveGeneratedFirebaseSw()],
});
