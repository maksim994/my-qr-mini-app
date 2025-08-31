import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    allowedHosts: ['b6da5e64b6a0.ngrok-free.app'], // Твой ngrok-URL
    proxy: {
      '/api/list': {
        target: 'https://g-qr.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/list/, '/api/1/list'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxy request URL for /api/list:', req.url); // Отладка
          });
        },
      },
      '/api': {
        target: 'https://g-qr.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/1/validate'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxy request URL for /api:', req.url); // Отладка
          });
        },
      },
    },
  },
  plugins: [react()],
});