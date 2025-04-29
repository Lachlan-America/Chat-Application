import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist'
  },
  server: {
    host: '0.0.0.0',  
    port: 3000,     
    open: '/home',
    historyApiFallback: true
  },
})
