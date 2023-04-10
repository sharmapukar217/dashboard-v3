import unocss from "unocss/vite";
import { defineConfig } from "vite";
import { telefunc } from "telefunc/vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [unocss(), telefunc(), sveltekit()],
  server: { port: 3000, host: "0.0.0.0" },
  preview: { port: 3000, host: "0.0.0.0" },
  define: {
    "import.meta.env.npm_package_version": JSON.stringify(process.env.npm_package_version),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  }
});
