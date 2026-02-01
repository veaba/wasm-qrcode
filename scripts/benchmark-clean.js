#!/usr/bin/env node

/**
 * 清理基准测试生成的文件
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const filesToClean = [
  'public/benchmark_node_result.json',
  'public/benchmark_bun_result.json',
  'public/benchmark_rust_result.json',
  'public/benchmark_summary.json',
  'packages/qrcode-node/benchmark/benchmark_result.json',
  'packages/qrcode-bun/benchmark_result.json',
];

console.log('\n🧹 清理基准测试文件...\n');

let cleaned = 0;
let skipped = 0;

filesToClean.forEach(file => {
  const filepath = path.join(rootDir, file);
  if (fs.existsSync(filepath)) {
    try {
      fs.unlinkSync(filepath);
      console.log(`  ✅ 已删除: ${file}`);
      cleaned++;
    } catch (e) {
      console.log(`  ❌ 删除失败: ${file}`);
    }
  } else {
    skipped++;
  }
});

console.log(`\n完成: ${cleaned} 个文件已删除, ${skipped} 个文件不存在\n`);
