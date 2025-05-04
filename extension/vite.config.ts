import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                { src: "public/manifest.json", dest: "." },
                { src: "public/assets/eye.png", dest: "assets" },
                { src: "public/icons", dest: "icons" },
            ],
        }),
    ],
    build: {
        outDir: "build",
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                background: path.resolve(__dirname, "src/background.ts"), // ✅ tells Vite to compile it
                overlay: path.resolve(__dirname, "src/content/overlay.ts"),
            },
            output: {
                entryFileNames: "[name].js", // ✅ makes sure output is named background.js, not hashed
            },
        },
    },
});
