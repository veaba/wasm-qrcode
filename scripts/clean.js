#!/usr/bin/env node
/**
 * 清理脚本 - 删除 node_modules 和 Rust 构建产物
 * 用法: pnpm run clean
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧹 开始清理项目...\n');

// 1. 删除根目录 node_modules
const rootNodeModules = join(rootDir, 'node_modules');
if (existsSync(rootNodeModules)) {
  console.log('📦 删除根目录 node_modules...');
  rmSync(rootNodeModules, { recursive: true, force: true });
  console.log('  ✅ 已删除\n');
}

// 2. 删除 packages 下的 node_modules
const packagesDir = join(rootDir, 'packages');
const packages = [
  'qrcode-bun',
  'qrcode-js',
  'qrcode-node',
  'qrcode-rust',
  'qrcode-fast',
  'qrcode-wasm',
  'qrcode-shared',
];

console.log('📦 删除 packages 下的 node_modules...');
for (const pkg of packages) {
  const pkgNodeModules = join(packagesDir, pkg, 'node_modules');
  if (existsSync(pkgNodeModules)) {
    rmSync(pkgNodeModules, { recursive: true, force: true });
    console.log(`  ✅ @veaba/${pkg}`);
  }
}
console.log('');

// 3. 删除 Rust target 目录
const rustTargets = [
  join(rootDir, 'target'),                          // 根目录 target
  join(packagesDir, 'qrcode-rust', 'target'),       // qrcode-rust target
  join(packagesDir, 'qrcode-fast', 'target'),       // qrcode-fast target
  join(packagesDir, 'qrcode-wasm', 'target'),       // qrcode-wasm target
  join(packagesDir, 'qrcode-wasm', 'pkg'),          // qrcode-wasm pkg (wasm-pack 输出)
];

console.log('🦀 删除 Rust 构建产物...');
for (const target of rustTargets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`  ✅ ${target.replace(rootDir, '.')}`);
  }
}
console.log('');

// 4. 删除 dist 目录
const distDirs = [
  join(packagesDir, 'qrcode-js', 'dist'),
  join(packagesDir, 'qrcode-node', 'dist'),
  join(packagesDir, 'qrcode-shared', 'dist'),
];

console.log('📁 删除 dist 构建目录...');
for (const dist of distDirs) {
  if (existsSync(dist)) {
    rmSync(dist, { recursive: true, force: true });
    console.log(`  ✅ ${dist.replace(rootDir, '.')}`);
  }
}
console.log('');

// 5. 删除日志和临时文件
const tempFiles = [
  join(rootDir, 'pnpm-debug.log'),
  join(rootDir, 'npm-debug.log'),
  join(rootDir, 'yarn-error.log'),
];

console.log('🗑️  删除临时文件...');
for (const file of tempFiles) {
  if (existsSync(file)) {
    rmSync(file, { force: true });
    console.log(`  ✅ ${file.replace(rootDir, '.')}`);
  }
}
console.log('');

// 6. 清理 pnpm 缓存（可选）
console.log('💡 提示: 如需清理 pnpm 缓存，请运行:\n  pnpm store prune\n');

console.log('✨ 清理完成！');
console.log('\n现在可以运行: pnpm install 重新安装依赖\n');
