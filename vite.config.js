import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets',   // your local assets folder
          dest: 'src'          // where to copy it inside dist/
        }
      ]
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
