import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts'
  },
  preload: {
    entry: 'src/preload/index.ts'
  },
  renderer: {
    root: '.',
    entry: 'src/renderer/index.tsx',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [react()]
  }
})
