#!/usr/bin/env node

/**
 * JavaScript QRCode 包性能基准测试
 * 
 * 对比:
 * - @veaba/qrcode-node
 * - @veaba/qrcode-bun
 * 
 * 注意: 此脚本需要先生成 TypeScript 构建文件
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'benchmark-output-js');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 测试用例
const testCases = [
  { name: 'Simple', text: 'Hello World' },
  { name: 'Complex', text: 'Test QR Code 123' },
  { name: 'URL', text: 'https://github.com/veaba/qrcodes' },
];

const RUNS = 100;

function log(message, color = 'reset') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function benchmarkNode(testCase) {
  log(`\n📦 @veaba/qrcode-node - ${testCase.name}`, 'blue');
  
  const testScript = `
import { QRCode } from '${rootDir.replace(/\\/g, '/')}/packages/qrcode-node/dist/index.js';

const text = ${JSON.stringify(testCase.text)};
const runs = ${RUNS};

const times = [];

// 预热
for (let i = 0; i < 5; i++) {
  const qr = new QRCode(text);
  qr.toSVG(256);
}

// 测试
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const qr = new QRCode(text);
  const svg = qr.toSVG(256);
  const end = performance.now();
  times.push(end - start);
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const min = Math.min(...times);
const max = Math.max(...times);

console.log('AVG:' + avg.toFixed(3));
console.log('MIN:' + min.toFixed(3));
console.log('MAX:' + max.toFixed(3));
`;
  
  const scriptPath = path.join(outputDir, '_bench_node.mjs');
  fs.writeFileSync(scriptPath, testScript);
  
  try {
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    
    const avg = parseFloat(output.match(/AVG:([\d.]+)/)?.[1] || '0');
    const min = parseFloat(output.match(/MIN:([\d.]+)/)?.[1] || '0');
    const max = parseFloat(output.match(/MAX:([\d.]+)/)?.[1] || '0');
    
    log(`  ⏱️  平均时间: ${avg.toFixed(3)} ms`, 'cyan');
    log(`  ⏱️  最短时间: ${min.toFixed(3)} ms`, 'cyan');
    log(`  ⏱️  最长时间: ${max.toFixed(3)} ms`, 'cyan');
    
    // 生成示例 SVG
    const sampleScript = `
import { QRCode } from '${rootDir.replace(/\\/g, '/')}/packages/qrcode-node/dist/index.js';
import fs from 'fs';
const qr = new QRCode(${JSON.stringify(testCase.text)});
fs.writeFileSync('${outputDir.replace(/\\/g, '/')}/${testCase.name}_node.svg', qr.toSVG(256));
console.log('MODULE_COUNT:' + qr.moduleCount);
`;
    fs.writeFileSync(scriptPath, sampleScript);
    const sampleOutput = execSync(`node "${scriptPath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    const moduleCount = sampleOutput.match(/MODULE_COUNT:(\d+)/)?.[1] || '0';
    log(`  📐 模块数: ${moduleCount}x${moduleCount}`, 'cyan');
    
    fs.unlinkSync(scriptPath);
    
    return { avg, min, max, moduleCount: parseInt(moduleCount) };
  } catch (error) {
    log(`  ❌ 错误: ${error.message}`, 'red');
    return null;
  }
}

async function benchmarkBun(testCase) {
  log(`\n📦 @veaba/qrcode-bun - ${testCase.name}`, 'blue');
  
  // 检查 Bun 是否安装
  try {
    execSync('bun --version', { stdio: 'pipe' });
  } catch {
    log('  ⚠️  Bun 未安装，跳过', 'yellow');
    return null;
  }
  
  const testScript = `
import { QRCode } from '${rootDir.replace(/\\/g, '/')}/packages/qrcode-bun/dist/index.js';

const text = ${JSON.stringify(testCase.text)};
const runs = ${RUNS};

const times = [];

// 预热
for (let i = 0; i < 5; i++) {
  const qr = new QRCode(text);
  qr.toSVG(256);
}

// 测试
for (let i = 0; i < runs; i++) {
  const start = performance.now();
  const qr = new QRCode(text);
  const svg = qr.toSVG(256);
  const end = performance.now();
  times.push(end - start);
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const min = Math.min(...times);
const max = Math.max(...times);

console.log('AVG:' + avg.toFixed(3));
console.log('MIN:' + min.toFixed(3));
console.log('MAX:' + max.toFixed(3));
`;
  
  const scriptPath = path.join(outputDir, '_bench_bun.ts');
  fs.writeFileSync(scriptPath, testScript);
  
  try {
    const output = execSync(`bun run "${scriptPath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    
    const avg = parseFloat(output.match(/AVG:([\d.]+)/)?.[1] || '0');
    const min = parseFloat(output.match(/MIN:([\d.]+)/)?.[1] || '0');
    const max = parseFloat(output.match(/MAX:([\d.]+)/)?.[1] || '0');
    
    log(`  ⏱️  平均时间: ${avg.toFixed(3)} ms`, 'cyan');
    log(`  ⏱️  最短时间: ${min.toFixed(3)} ms`, 'cyan');
    log(`  ⏱️  最长时间: ${max.toFixed(3)} ms`, 'cyan');
    
    // 生成示例 SVG
    const sampleScript = `
import { QRCode } from '${rootDir.replace(/\\/g, '/')}/packages/qrcode-bun/dist/index.js';
import fs from 'fs';
const qr = new QRCode(${JSON.stringify(testCase.text)});
fs.writeFileSync('${outputDir.replace(/\\/g, '/')}/${testCase.name}_bun.svg', qr.toSVG(256));
console.log('MODULE_COUNT:' + qr.moduleCount);
`;
    fs.writeFileSync(scriptPath, sampleScript);
    const sampleOutput = execSync(`bun run "${scriptPath}"`, { encoding: 'utf-8', stdio: 'pipe' });
    const moduleCount = sampleOutput.match(/MODULE_COUNT:(\d+)/)?.[1] || '0';
    log(`  📐 模块数: ${moduleCount}x${moduleCount}`, 'cyan');
    
    fs.unlinkSync(scriptPath);
    
    return { avg, min, max, moduleCount: parseInt(moduleCount) };
  } catch (error) {
    log(`  ❌ 错误: ${error.message}`, 'red');
    return null;
  }
}

async function main() {
  console.log('\n🚀 JavaScript QRCode 包性能基准测试');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('对比包: @veaba/qrcode-node, @veaba/qrcode-bun');
  console.log(`每测试运行: ${RUNS} 次`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n📋 测试用例: ${testCase.name}`);
    console.log(`   文本: "${testCase.text}"`);
    console.log('───────────────────────────────────────────────────────────────────');
    
    const nodeResult = await benchmarkNode(testCase);
    const bunResult = await benchmarkBun(testCase);
    
    results.push({
      testCase,
      node: nodeResult,
      bun: bunResult,
    });
  }
  
  // 打印总结
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                      📊 性能基准测试总结报告                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  
  console.log('\n┌─────────────────────┬─────────────────────┬─────────────────────┐');
  console.log(`│ ${'测试用例'.padEnd(19)} │ ${'Node.js (ms)'.padStart(19)} │ ${'Bun (ms)'.padStart(19)} │`);
  console.log('├─────────────────────┼─────────────────────┼─────────────────────┤');
  
  for (const r of results) {
    const name = r.testCase.name.padEnd(19);
    const node = r.node ? `${r.node.avg.toFixed(3)}`.padStart(19) : 'N/A'.padStart(19);
    const bun = r.bun ? `${r.bun.avg.toFixed(3)}`.padStart(19) : 'N/A'.padStart(19);
    console.log(`│ ${name} │ ${node} │ ${bun} │`);
  }
  
  console.log('└─────────────────────┴─────────────────────┴─────────────────────┘');
  
  // 速度对比
  console.log('\n📈 速度对比 (Bun vs Node.js):');
  for (const r of results) {
    if (r.node && r.bun) {
      const speedup = r.node.avg / r.bun.avg;
      console.log(`  ${r.testCase.name}: Bun 快 ${speedup.toFixed(2)}x`);
    }
  }
  
  console.log('\n✅ 基准测试完成!');
  console.log(`📁 输出目录: ${outputDir}`);
  
  // 列出生成的文件
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.svg'));
  if (files.length > 0) {
    console.log('\n📄 生成的 SVG 文件:');
    files.forEach(f => {
      const stats = fs.statSync(path.join(outputDir, f));
      console.log(`  - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  }
}

main().catch(console.error);
