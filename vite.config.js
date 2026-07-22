import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "firebase-vendor",
              test: /node_modules[\\/](@firebase|firebase)/,
              maxSize: 250000,
              priority: 30,
            },
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)/,
              priority: 20,
            },
            {
              name: "icons-vendor",
              test: /node_modules[\\/]react-icons/,
              priority: 15,
            },
            {
              name: "vendor",
              test: /node_modules/,
              maxSize: 250000,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
