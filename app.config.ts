import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config();

export default defineConfig({
  solid: {
    babel: {
      compact: true,
    },
  },
  vite: {
    plugins: [tsconfigPaths() as any, tailwindcss()],
  },
});
