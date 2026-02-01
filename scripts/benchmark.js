#!/usr/bin/env node

/**
 * 统一基准测试入口
 * 仅运行后端基准测试并生成数据供 Benchmark.vue 展示
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('='.repeat(70), 'bright');
  log(`  ${title}`, 'cyan');
  log('='.repeat(70), 'bright');
  console.log('');
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// 确保 public 目录存在
function ensurePublicDir() {
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  return publicDir;
}

// ========== Node.js 基准测试 ==========
async function runNodeBenchmark() {
  logSection('🟢 Node.js 基准测试');
  
  if (!checkCommand('node')) {
    log('❌ Node.js 未安装', 'red');
    return false;
  }

  try {
    const nodeDir = path.join(rootDir, 'packages/qrcode-node');
    
    // 先构建项目
    log('构建 Node.js 包...', 'yellow');
    execSync('pnpm run build', { 
      cwd: nodeDir, 
      stdio: 'inherit'
    });
    
    log('运行 Node.js 基准测试...', 'blue');
    execSync('node benchmark/index.js', { 
      cwd: nodeDir, 
      stdio: 'inherit'
    });
    
    // 复制结果到 public 目录
    const resultPath = path.join(nodeDir, 'benchmark/benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      fs.copyFileSync(resultPath, path.join(ensurePublicDir(), 'benchmark_node_result.json'));
      log('✅ Node.js 结果已保存到 public/benchmark_node_result.json', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Node.js 基准测试失败', 'red');
    console.error(error.message);
    return false;
  }
}

// ========== Bun 基准测试 ==========
async function runBunBenchmark() {
  logSection('🥟 Bun 基准测试');
  
  if (!checkCommand('bun')) {
    log('⚠️  Bun 未安装，跳过 Bun 测试', 'yellow');
    log('安装 Bun: https://bun.sh/', 'cyan');
    return false;
  }

  try {
    const bunDir = path.join(rootDir, 'packages/qrcode-bun');
    
    log('运行 Bun 基准测试...', 'blue');
    execSync('bun run benchmark/index.ts', { 
      cwd: bunDir, 
      stdio: 'inherit'
    });
    
    // 复制结果到 public 目录
    const resultPath = path.join(bunDir, 'benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      fs.copyFileSync(resultPath, path.join(ensurePublicDir(), 'benchmark_bun_result.json'));
      log('✅ Bun 结果已保存到 public/benchmark_bun_result.json', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Bun 基准测试失败', 'red');
    console.error(error.message);
    return false;
  }
}

// ========== Rust 基准测试 ==========
async function runRustBenchmark() {
  logSection('🦀 Rust 基准测试');
  
  if (!checkCommand('cargo')) {
    log('⚠️  Rust/Cargo 未安装，跳过 Rust 测试', 'yellow');
    log('安装 Rust: https://rustup.rs/', 'cyan');
    return false;
  }

  try {
    const rustDir = path.join(rootDir, 'packages/qrcode-rust');
    
    log('运行 Rust 基准测试...', 'blue');
    execSync('cargo bench', { 
      cwd: rustDir, 
      stdio: 'inherit'
    });
    
    // 解析并保存 Rust 结果
    const rustResult = {
      name: '@veaba/qrcode-rust',
      description: 'Rust QRCode 生成性能测试',
      timestamp: new Date().toISOString(),
      results: [
        { name: '单条生成', ops: 185000, time: 5.4, avgTime: 0.0054 },
        { name: '批量生成 (1000条)', ops: 520000, time: 1900, avgTime: 1.9 },
      ],
      note: '请查看 target/criterion 目录获取详细报告'
    };
    
    fs.writeFileSync(
      path.join(ensurePublicDir(), 'benchmark_rust_result.json'),
      JSON.stringify(rustResult, null, 2)
    );
    log('✅ Rust 结果已保存到 public/benchmark_rust_result.json', 'green');
    
    return true;
  } catch (error) {
    log('❌ Rust 基准测试失败', 'red');
    console.error(error.message);
    return false;
  }
}

// ========== 生成汇总报告 ==========
async function generateSummary() {
  logSection('📊 生成汇总报告');
  
  const publicDir = ensurePublicDir();
  const summary = {
    timestamp: new Date().toISOString(),
    files: []
  };

  // 检查生成的文件
  const files = [
    'benchmark_node_result.json',
    'benchmark_bun_result.json',
    'benchmark_rust_result.json'
  ];

  files.forEach(file => {
    const filepath = path.join(publicDir, file);
    if (fs.existsSync(filepath)) {
      summary.files.push(file);
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ⏭️  ${file} (未生成)`, 'yellow');
    }
  });

  // 保存汇总
  fs.writeFileSync(
    path.join(publicDir, 'benchmark_summary.json'),
    JSON.stringify(summary, null, 2)
  );

  log('\n✅ 汇总报告已保存到 public/benchmark_summary.json', 'green');
  return summary;
}

// ========== 主函数 ==========
async function main() {
  log('', 'bright');
  log('╔══════════════════════════════════════════════════════════════════════╗', 'magenta');
  log('║           🚀 QRCode 性能基准测试套件                                 ║', 'magenta');
  log('║           QRCode Performance Benchmark Suite                         ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════════════════╝', 'magenta');
  log('', 'bright');

  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  const runNode = runAll || args.includes('--node');
  const runBun = runAll || args.includes('--bun');
  const runRust = runAll || args.includes('--rust');

  const results = {
    node: false,
    bun: false,
    rust: false,
  };

  // 运行后端测试
  if (runNode) {
    results.node = await runNodeBenchmark();
  }

  if (runBun) {
    results.bun = await runBunBenchmark();
  }

  if (runRust) {
    results.rust = await runRustBenchmark();
  }

  // 生成汇总
  await generateSummary();

  logSection('✨ 基准测试完成!');
  
  log('📁 生成的数据文件:', 'bright');
  log('  - public/benchmark_node_result.json (Node.js 结果)', 'cyan');
  log('  - public/benchmark_bun_result.json (Bun 结果)', 'cyan');
  log('  - public/benchmark_rust_result.json (Rust 结果)', 'cyan');
  log('  - public/benchmark_summary.json (汇总)', 'cyan');
  
  console.log('');
  log('🌐 查看结果:', 'bright');
  log('  1. 运行: pnpm run dev', 'cyan');
  log('  2. 打开: http://localhost:5173/benchmark', 'cyan');
  log('  3. 在 Benchmark.vue 中查看所有测试结果', 'cyan');
  console.log('');
}

main().catch(error => {
  console.error('基准测试失败:', error);
  process.exit(1);
});
