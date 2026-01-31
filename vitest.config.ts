import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/src/**/*.test.{ts,js}', 'packages/**/test/**/*.{ts,js}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.js'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.{ts,js}'],
    },
  },
});
