import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://open.bigmodel.cn",
        changeOrigin: true
      }
    }
  }
});
