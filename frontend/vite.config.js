import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SERVER_IP = '10.155.76.141';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes server to network
    port: 3000,
    proxy: {
      '/api': {
        target: `http://${SERVER_IP}:8080`, // API Gateway
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
