import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
export default defineConfig({
    main: {
        build: {
            rollupOptions: {
                external: ['chokidar']
            }
        }
    },
    preload: {},
    renderer: {
        root: '.',
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, 'src/renderer/index.html')
                }
            }
        },
        plugins: [react()]
    }
});
