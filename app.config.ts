import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: 'vercel',
    experimental: {
      websocket: true
    }
  },
  vite: {
    ssr: { external: ["drizzle-orm"] },
  },
}).addRouter({
  name: "_ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/_ws",
});;
