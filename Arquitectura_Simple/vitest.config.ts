import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@domain": path.resolve(__dirname, "src/domain"),
            "@application": path.resolve(__dirname, "src/application"),
            "@infrastructure": path.resolve(__dirname, "src/infrastructure"),
            "@composition": path.resolve(__dirname, "src/composition"),
            "@shared": path.resolve(__dirname, "src/shared"),
        },
    },
    test: {
        include: [
            "src/**/*.{test,spec}.{ts,js}",
            "tests/**/*.{test,spec}.{ts,js}",
        ],
    },
});
