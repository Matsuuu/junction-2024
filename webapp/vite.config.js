import { defineConfig } from "vite";

/** @type { import("vite").UserConfig} */
const config = defineConfig({
  plugins: [],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          console.log(id);
          if (id.includes("three")) {
            return "three";
          } else if (id.includes("thatopen")) {
            return "thatopen";
          } else if (id.includes("shoelace")) {
            return "shoelace";
          } else if (id.includes("ifc")) {
            return "ifc";
          } else {
            return "index";
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 8000,
    watch: {
      usePolling: true,
    },
  },
});

export default config;
