import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      // Alias to resolve the turbo-spark package correctly
      'turbo-spark': path.resolve(__dirname, '../turbo-spark/dist')
    }
  },
  build: {
    rollupOptions: {
      external: [],  // Add any external dependencies you don't want to bundle
    },
    types: [
      {
        declarationDir: "dist/types",
        root: resolve(__dirname, "types"),
        entry: "main.ts",
      },
    ],
  }
});