import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
      '@veaba/shared': '/packages/shared/src/index.ts',
      '@veaba/qrcodejs': '/packages/qrcodejs/src/index.js',
      '@veaba/qrcode-wasm': '/packages/qrcode-wasm/pkg/wasm_qrcode',
    }
  },
  server: {
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    exclude: ['wasm-qrcode', '@veaba/shared']
  }
})
