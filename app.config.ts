import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: 'vercel'
  },
  vite: {
    ssr: { external: ["drizzle-orm"] },
  },
});
