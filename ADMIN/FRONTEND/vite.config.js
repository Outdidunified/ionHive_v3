import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://192.168.1.15:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://192.168.1.15:3001',
        changeOrigin: true,
      },
    },
  },
});
