import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: [
            { find: '@domain', replacement: path.resolve(__dirname, 'src/domain') },
            { find: '@application', replacement: path.resolve(__dirname, 'src/application') },
            { find: '@aplication', replacement: path.resolve(__dirname, 'src/application') },
            { find: '@infrastructure', replacement: path.resolve(__dirname, 'src/infrastructure') },
            { find: '@infrastructura', replacement: path.resolve(__dirname, 'src/infrastructure') },
            { find: '@shared', replacement: path.resolve(__dirname, 'src/shared') },
            { find: '@share', replacement: path.resolve(__dirname, 'src/shared') },
            { find: '@composition', replacement: path.resolve(__dirname, 'src/composition') }
        ]
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts']
    }
});

