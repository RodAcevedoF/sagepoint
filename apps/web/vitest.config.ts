import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test"),
      root: path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    alias: {
      "\\.(webp|png|jpg|jpeg|gif|svg)$": path.resolve(
        __dirname,
        "./test/_helpers/file-mock.ts",
      ),
    },
    include: ["test/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/web",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/index.ts",
        "src/app/**/*.{ts,tsx}",
        "src/domain/**",
        "src/**/*.d.ts",
      ],
    },
  },
});
