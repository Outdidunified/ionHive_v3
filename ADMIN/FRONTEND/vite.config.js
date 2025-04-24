import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.222:8383',  // The backend URL to forward the request to
        changeOrigin: true,  // This makes sure that the origin header is modified (so backend thinks request comes from the correct origin)
        rewrite: path => path.replace(/^\/api/, '')  // This rewrites the path by removing '/api'
      }
    }
  }
  
});
