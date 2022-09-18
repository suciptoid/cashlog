/// <reference types="vitest" />
/// <reference types="vite/client" />
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
  test: {
    environment: "node",
    watch: false,
    setupFiles: ["./setup-test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
    includeSource: ["app/**/*.{js,ts}"],
  },
});
