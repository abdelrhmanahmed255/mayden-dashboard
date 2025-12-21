import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Backend API URL
var API_URL = 'https://pdf-backend-xi.vercel.app';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            // Proxy /uploads/portal/user_documents/* to backend /download/* endpoint
            '/uploads/portal/user_documents': {
                target: API_URL,
                changeOrigin: true,
                rewrite: function (path) { return path; },
            },
            // Proxy /download/* requests directly to backend
            '/download': {
                target: API_URL,
                changeOrigin: true,
            },
            // Proxy /view/* requests directly to backend  
            '/view': {
                target: API_URL,
                changeOrigin: true,
            },
        },
    },
});
