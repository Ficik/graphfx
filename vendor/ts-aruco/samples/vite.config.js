import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://axeljaeger.github.io/ts-aruco/",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        getusermedia: resolve(__dirname, "getusermedia.html"),
        debug: resolve(__dirname, "debug.html"),
        debugPosit: resolve(__dirname, "debug-posit.html"),
      },
    },
  },
});
