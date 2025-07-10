import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: ['.ngrok-free.app']
      }
    };
});
