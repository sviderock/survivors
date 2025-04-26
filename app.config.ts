import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import { comlink } from "vite-plugin-comlink";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config();

export default defineConfig({
  middleware: "./src/middleware.ts",
  solid: {
    babel: {
      compact: true,
    },
  },

  vite: {
    ssr: { external: ["drizzle-orm"] },
    plugins: [tsconfigPaths(), comlink(), tailwindcss()],
    worker: {
      plugins: () => [comlink()],
    },
  },
});
