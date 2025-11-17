import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: { overlay: false }, // hide full-screen overlay if a file is temporarily locked
    watch: {
      usePolling: true,
      interval: 120,
      awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 120 },
    },
  },
});
