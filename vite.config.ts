import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ProxyServer } from 'http-proxy'; // Импорт типа для прокси

export default defineConfig({
  server: {
    allowedHosts: ['b203ebf4d2d5.ngrok-free.app'], // Твой ngrok-URL
    proxy: {
      '/api/list': {
        target: 'https://g-qr.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/list/, '/api/1/list'),
        configure: (proxy: ProxyServer, _options) => {
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            console.log('Proxy request URL for /api/list:', req.url); // Отладка
          });
        },
      },
      '/api': {
        target: 'https://g-qr.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/1/validate'),
        configure: (proxy: ProxyServer, _options) => {
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            console.log('Proxy request URL for /api:', req.url); // Отладка
          });
        },
      },
    },
  },
  plugins: [react()],
});
