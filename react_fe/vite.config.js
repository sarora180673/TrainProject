import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Binds to 0.0.0.0 so it's accessible outside the container
    port: 5173, 
    strictPort: true, // Prevents Vite from automatically switching ports if 5173 is busy
  },
  plugins: [react()],
})
