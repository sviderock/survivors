import { defineConfig } from "@solidjs/start/config";
import tsconfigPaths from "vite-tsconfig-paths";


export default defineConfig({
  server: {
    experimental: {
      websocket: true,
    },
  },
  solid: {
    babel: {
      compact: true
    },
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
  plugins: () => [tsconfigPaths()]
});;
