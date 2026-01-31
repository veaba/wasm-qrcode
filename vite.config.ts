import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    exclude: ['wasm-qrcode']
  }
})
