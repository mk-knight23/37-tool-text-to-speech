import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "html"],
      reportsDirectory: "./coverage",
      // Coverage targets the pure logic layer (lib + hooks). UI components and
      // route files are exercised by the Playwright smoke, not unit coverage.
      include: ["src/lib/**", "src/hooks/**"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/test/**",
        // Browser-only integrations exercised via Playwright, not unit tests:
        "src/lib/parsers/pdf.ts", // pdfjs worker — needs a real browser
        "src/lib/ai/client.ts", // fetch/stream wrapper — covered by smoke
      ],
      // Conservative floors: the lib logic sits well above these; the hooks and
      // speechSynthesis wrappers are covered by the Playwright smoke, not units.
      thresholds: {
        statements: 75,
        branches: 65,
        functions: 72,
        lines: 78,
      },
    },
  },
});
