import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest Browser Mode Configuration
 * Used for testing WASM modules in real browser environment
 * 
 * @see https://vitest.dev/guide/browser/config.html
 */
export default defineConfig({
  resolve: {
    alias: {
      '@veaba/qrcode-js': path.resolve(__dirname, 'packages/qrcode-js/src/index.ts'),
      '@veaba/qrcode-js-shared': path.resolve(__dirname, 'packages/qrcode-js-shared/dist/index.js'),
      '@veaba/qrcode-wasm': path.resolve(__dirname, 'packages/qrcode-wasm/src/index.ts'),
    },
  },
  test: {
    // Browser mode configuration
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // Use system Chrome/Chromium instead of downloading
      providerOptions: {
        launch: {
          // In CI, use Playwright's bundled Chromium; locally, use system Chrome
          ...(process.env.CI ? {} : {
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          }),
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        headless: !process.env.HEADED,
      },
    },
    // Test files pattern - only browser tests
    include: ['tests/**/*.browser.test.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  // Server configuration for serving WASM files
  server: {
    fs: {
      // Allow serving files outside of root (for WASM files)
      strict: false,
    },
    // Configure headers for WASM
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
