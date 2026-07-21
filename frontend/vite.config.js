import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api/core": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/api/support": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
      "/api/public": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
      "/api/notifications": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
    },
  },
});
