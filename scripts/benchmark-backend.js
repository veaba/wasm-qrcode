#!/usr/bin/env node

/**
 * 后端基准测试脚本
 * 运行 Node.js、Bun 和 Rust 的基准测试
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function ensurePublicDir() {
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  return publicDir;
}

async function benchmarkNode() {
  log('\n🟢 运行 Node.js 基准测试...', 'blue');
  
  const nodeDir = path.join(rootDir, 'packages/qrcode-node');
  
  try {
    execSync('npx ts-node benchmark/index.ts', { 
      cwd: nodeDir, 
      stdio: 'inherit'
    });
    
    const resultPath = path.join(nodeDir, 'benchmark/benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      fs.copyFileSync(resultPath, path.join(ensurePublicDir(), 'benchmark_node_result.json'));
      log('✅ Node.js 结果已保存', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Node.js 测试失败', 'red');
    return false;
  }
}

async function benchmarkBun() {
  if (!checkCommand('bun')) {
    log('\n⚠️  Bun 未安装，跳过', 'yellow');
    return false;
  }
  
  log('\n🥟 运行 Bun 基准测试...', 'blue');
  
  const bunDir = path.join(rootDir, 'packages/qrcode-bun');
  
  try {
    execSync('bun run benchmark/index.ts', { 
      cwd: bunDir, 
      stdio: 'inherit'
    });
    
    const resultPath = path.join(bunDir, 'benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      fs.copyFileSync(resultPath, path.join(ensurePublicDir(), 'benchmark_bun_result.json'));
      log('✅ Bun 结果已保存', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Bun 测试失败', 'red');
    return false;
  }
}

async function benchmarkRust() {
  if (!checkCommand('cargo')) {
    log('\n⚠️  Rust 未安装，跳过', 'yellow');
    return false;
  }
  
  log('\n🦀 运行 Rust 基准测试...', 'blue');
  
  const rustDir = path.join(rootDir, 'packages/qrcode-rust');
  
  try {
    execSync('cargo bench', { 
      cwd: rustDir, 
      stdio: 'inherit'
    });
    
    log('✅ Rust 测试完成', 'green');
    return true;
  } catch (error) {
    log('❌ Rust 测试失败', 'red');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('  后端基准测试', 'cyan');
  log('='.repeat(60), 'bright');
  
  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  
  const results = {
    node: runAll || args.includes('--node') ? await benchmarkNode() : false,
    bun: runAll || args.includes('--bun') ? await benchmarkBun() : false,
    rust: runAll || args.includes('--rust') ? await benchmarkRust() : false,
  };
  
  log('\n' + '='.repeat(60), 'bright');
  log('  测试完成', 'green');
  log('='.repeat(60), 'bright');
  
  Object.entries(results).forEach(([name, success]) => {
    if (success) {
      log(`  ✅ ${name.toUpperCase()}`, 'green');
    }
  });
  
  log('\n💡 提示: 运行 pnpm run dev 后在 Benchmark.vue 中查看结果', 'cyan');
  log('');
}

main().catch(console.error);
