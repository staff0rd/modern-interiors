import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { metadataPlugin } from "./vite/metadataPlugin.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), metadataPlugin()],
});
