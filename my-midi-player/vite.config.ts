import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure this points to the root
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
