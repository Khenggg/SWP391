import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./test-results/component/coverage",
    },
  },
});
