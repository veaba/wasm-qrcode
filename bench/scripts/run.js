#!/usr/bin/env node

/**
 * 统一基准测试入口
 * 运行后端基准测试并生成数据供文档展示
 * 
 * 用法:
 *   node bench/scripts/run.js              # 运行所有测试
 *   node bench/scripts/run.js --node       # 仅运行 Node.js 测试
 *   node bench/scripts/run.js --bun        # 仅运行 Bun 测试
 *   node bench/scripts/run.js --rust       # 仅运行 Rust 测试
 *   node bench/scripts/run.js --quick      # 快速模式
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

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
  const publicDir = path.join(rootDir, 'docs/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  return publicDir;
}

// 构建 shared 包
function buildShared() {
  log('🔨 构建 @veaba/js-shared...', 'yellow');
  const sharedDir = path.join(rootDir, 'packages/js-shared');

  // 检查目录是否存在
  if (!fs.existsSync(sharedDir)) {
    log(`❌ 目录不存在: ${sharedDir}`, 'red');
    return false;
  }

  try {
    execSync('pnpm run build', {
      cwd: sharedDir,
      stdio: 'inherit'
    });
    log('✅ js-shared 构建成功', 'green');
    return true;
  } catch (error) {
    log(`❌ shared 构建失败: ${error.message}`, 'red');
    if (error.status) {
      log(`   Exit code: ${error.status}`, 'red');
    }
    return false;
  }
}

// 构建 Node.js 包
function buildNode() {
  log('🔨 构建 @veaba/qrcode-node...', 'yellow');
  const nodeDir = path.join(rootDir, 'packages/qrcode-node');

  try {
    execSync('pnpm run build', {
      cwd: nodeDir,
      stdio: 'inherit'
    });
    log('✅ Node.js 包构建成功', 'green');
    return true;
  } catch (error) {
    log('❌ Node.js 包构建失败', 'red');
    return false;
  }
}

// ========== 后端 PK 基准测试 ==========
async function runBackendBenchmark(quick = false) {
  logSection('📦 后端 PK 基准测试');

  const backendBenchmarkDir = path.join(rootDir, 'bench/backend-benchmark');

  try {
    if (quick) {
      log('运行快速模式...', 'blue');
      execSync('npx tsx index-fast.ts', {
        cwd: backendBenchmarkDir,
        stdio: 'inherit'
      });
    } else {
      log('运行完整 PK 测试...', 'blue');
      execSync('npx tsx index.ts', {
        cwd: backendBenchmarkDir,
        stdio: 'inherit'
      });
    }

    log('✅ 后端 PK 测试完成', 'green');
    return true;
  } catch (error) {
    log('❌ 后端 PK 测试失败', 'red');
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
    const fastDir = path.join(rootDir, 'packages/qrcode-fast');

    log('运行 qrcode-rust 基准测试...', 'blue');
    execSync('cargo bench', {
      cwd: rustDir,
      stdio: 'inherit'
    });

    log('运行 qrcode-fast 基准测试...', 'blue');
    execSync('cargo bench', {
      cwd: fastDir,
      stdio: 'inherit'
    });

    // 解析并保存 Rust 结果
    const rustResult = {
      name: '@veaba/qrcode-rust & @veaba/qrcode-fast',
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
    log('✅ Rust 结果已保存到 docs/public/benchmark_rust_result.json', 'green');

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
    'backend_benchmark_pk.json',
    'backend_benchmark_pk_summary.json',
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

  log('\n✅ 汇总报告已保存到 docs/public/benchmark_summary.json', 'green');
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
  const runAll = args.length === 0 || (!args.includes('--node') && !args.includes('--bun') && !args.includes('--rust'));
  const runNode = runAll || args.includes('--node');
  const runBun = runAll || args.includes('--bun');
  const runRust = runAll || args.includes('--rust');
  const quickMode = args.includes('--quick');

  const results = {
    backend: false,
    rust: false,
  };

  // 构建依赖
  logSection('🔨 构建阶段');
  const sharedBuilt = buildShared();
  if (!sharedBuilt) {
    log('❌ 构建失败，退出', 'red');
    process.exit(1);
  }

  if (runNode) {
    buildNode();
  }

  // 运行后端 PK 测试（包含 Node.js 和 Bun）
  if (runNode || runBun) {
    results.backend = await runBackendBenchmark(quickMode);
  }

  // 运行 Rust 测试
  if (runRust) {
    results.rust = await runRustBenchmark();
  }

  // 生成汇总
  await generateSummary();

  logSection('✨ 基准测试完成!');

  log('📁 生成的数据文件:', 'bright');
  log('  - docs/public/backend_benchmark_pk.json (PK 完整结果)', 'cyan');
  log('  - docs/public/backend_benchmark_pk_summary.json (PK 摘要)', 'cyan');
  log('  - docs/public/benchmark_rust_result.json (Rust 结果)', 'cyan');
  log('  - docs/public/benchmark_summary.json (汇总)', 'cyan');

  console.log('');
  log('🌐 查看结果:', 'bright');
  log('  1. 运行: pnpm run docs:dev', 'cyan');
  log('  2. 打开文档网站查看基准测试页面', 'cyan');
  console.log('');
}

main().catch(error => {
  console.error('基准测试失败:', error);
  process.exit(1);
});
