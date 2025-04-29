import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist'
  },
  server: {
    host: '0.0.0.0',  // Bind to all available network interfaces
    port: 3000,     // (optional) specify the port, change if needed
    https: false, // (optional) enable HTTPS, change if needed
    open: '/home',
    historyApiFallback: true
  },
})
