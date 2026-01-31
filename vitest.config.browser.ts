import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.test.{ts,js}', 'packages/**/test/**/*.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 10000,
    hookTimeout: 10000,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: true,
    },
  },
});
