import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Set the correct output directory and assets path
        outDir: "public/build",
        assetsDir: "assets",
    },
    base:
        process.env.APP_ENV === "production"
            ? "https://cha-time.vercel.app/"
            : "/",
});
