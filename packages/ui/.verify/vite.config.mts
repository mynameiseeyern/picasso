import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "../src") } },
  build: { outDir: path.resolve(import.meta.dirname, "dist"), emptyOutDir: true,
    assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false },
});
