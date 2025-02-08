import { defineConfig } from "@solidjs/start/config";
import crypto from "crypto"



export default defineConfig({
  server: {
    experimental: {
      websocket: true,
    },
  },
  vite: {
    ssr: { external: ["drizzle-orm"] },
    css: {
      modules: {
        // Need to generate css module names based on only the file path and class name
        // because the dev reloading doesn't work well when classes change when css contents change.
        generateScopedName(name, filename, css) {
          const hasher = crypto.createHash("sha256")
          hasher.update(name + filename)
          const hash = hasher.digest().toString("hex");
          return `${name}__${hash.substring(0, 16)}`
        },
      }
    }
  },
}).addRouter({
  name: "_ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/_ws",
});;
