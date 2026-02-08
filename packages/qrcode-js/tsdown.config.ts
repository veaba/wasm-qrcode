import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'iife'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
  // 将 workspace 依赖打包进 bundle
  noExternal: ['@veaba/js-shared'],
  // IIFE 格式配置
  globalName: 'QRCodeJS',
});
