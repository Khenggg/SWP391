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
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/support": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/api/public": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
