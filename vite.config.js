import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/cm-api": {
        target: "https://api.chartmetric.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cm-api/, "/api"),
      },
    },
  },
});
