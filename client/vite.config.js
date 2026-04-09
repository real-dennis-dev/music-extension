import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ This ensures correct paths inside extension
  base: './',

  build: {
    outDir: 'dist',       // build directly into extension folder
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html') // your main HTML
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },

  // ✅ THIS is the key part
  publicDir: 'public',

  server: {
    port: 5173
  }
})