import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import TsconfigPaths from 'vite-tsconfig-paths'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [TsconfigPaths()],
    test: {
        include: [
            "src/**/*.{test,spec}.{ts,js}",
            "tests/**/*.{test,spec}.{ts,js}",
        ],
        environment: 'node',
        globals: true,
    },
});
