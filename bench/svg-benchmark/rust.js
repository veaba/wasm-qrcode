#!/usr/bin/env node

/**
 * Rust QRCode 包 SVG 性能基准测试
 * 
 * 对比以下包：
 * - kennytm-qrcode (社区参考)
 * - @veaba/qrcode-rust
 * - @veaba/qrcode-fast
 * 
 * 功能：
 * 1. 生成 SVG
 * 2. 验证二维码可扫描性 (使用 resvg + rqrr)
 * 3. 对比性能
 * 4. 生成 JSON 报告
 * 
 * 使用方法:
 *   node bench/svg-benchmark/rust.js          # 完整模式 (100次运行)
 *   node bench/svg-benchmark/rust.js --quick  # 快速模式 (10次运行)
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const rustToolsDir = path.join(rootDir, 'bench/rust-tools');
const outputDir = path.join(rootDir, 'docs/bench/benchmark-output');
const publicDir = path.join(rootDir, 'docs/public');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(70), 'bright');
  log(`  ${title}`, 'cyan');
  log('='.repeat(70), 'bright');
}

// 确保输出目录存在
function ensureOutputDir() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  return outputDir;
}

// 检查 cargo 是否安装
function checkCargo() {
  try {
    execSync('cargo --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// 构建 Rust 工具
function buildRustTools() {
  log('🔨 构建 Rust 工具...', 'blue');
  
  try {
    execSync('cargo build --release --features validation --bin benchmark-full', {
      cwd: rustToolsDir,
      stdio: 'inherit'
    });
    log('✅ 构建成功', 'green');
    return true;
  } catch (error) {
    log('❌ 构建失败', 'red');
    console.error(error.message);
    return false;
  }
}

// 运行基准测试
function runBenchmark(quick = false) {
  log(`\n🚀 运行基准测试 (${quick ? '快速模式' : '完整模式'})...`, 'blue');
  
  const args = quick ? ['--quick'] : [];
  // 添加输出目录参数
  args.push('--output-dir', outputDir);
  
  try {
    const result = spawn(
      'cargo',
      ['run', '--release', '--features', 'validation', '--bin', 'benchmark-full', '--', ...args],
      {
        cwd: rustToolsDir,
        stdio: 'inherit',
        shell: true
      }
    );
    
    return new Promise((resolve) => {
      result.on('close', (code) => {
        if (code === 0) {
          log('✅ 基准测试完成', 'green');
          resolve(true);
        } else {
          log('❌ 基准测试失败', 'red');
          resolve(false);
        }
      });
    });
  } catch (error) {
    log('❌ 运行失败', 'red');
    console.error(error.message);
    return false;
  }
}

// 显示结果
function showResults() {
  logSection('测试结果');
  
  // 检查输出文件
  if (!fs.existsSync(outputDir)) {
    log('❌ 输出目录不存在', 'red');
    return;
  }
  
  const files = fs.readdirSync(outputDir);
  const svgFiles = files.filter(f => f.endsWith('.svg'));
  const reportFile = files.find(f => f === 'benchmark-report.json');
  
  log('\n📁 输出目录:', 'cyan');
  log(`   ${outputDir}`);
  
  if (svgFiles.length > 0) {
    log('\n📄 生成的 SVG 文件:', 'cyan');
    svgFiles.forEach(f => {
      const stats = fs.statSync(path.join(outputDir, f));
      log(`   - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  }
  
  if (reportFile) {
    log('\n📊 报告文件:', 'cyan');
    log(`   - ${reportFile}`);
    
    // 复制 JSON 到 public 目录
    try {
      const srcPath = path.join(outputDir, reportFile);
      const dstPath = path.join(publicDir, 'benchmark_svg_rust.json');
      fs.copyFileSync(srcPath, dstPath);
      log(`   - 已复制到: docs/public/benchmark_svg_rust.json`, 'green');
    } catch (e) {
      log('   (复制到 public 目录失败)', 'yellow');
    }
    
    // 显示报告摘要
    try {
      const report = JSON.parse(fs.readFileSync(path.join(outputDir, reportFile), 'utf-8'));
      
      if (report.test_cases && report.test_cases.length > 0) {
        log('\n📈 性能摘要 (平均时间):', 'bright');
        log('┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐');
        log(`│ ${'测试用例'.padEnd(19)} │ ${'kennytm (µs)'.padStart(19)} │ ${'qrcode-rust (µs)'.padStart(19)} │ ${'qrcode-fast (µs)'.padStart(19)} │`);
        log('├─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤');
        
        report.test_cases.forEach(tc => {
          const name = (tc.name || 'Unknown').padEnd(19);
          const kennytm = tc.kennytm ? `${tc.kennytm.avg_time_us.toFixed(0)}`.padStart(19) : 'N/A'.padStart(19);
          const rust = tc.qrcode_rust ? `${tc.qrcode_rust.avg_time_us.toFixed(0)}`.padStart(19) : 'N/A'.padStart(19);
          const fast = tc.qrcode_fast ? `${tc.qrcode_fast.avg_time_us.toFixed(0)}`.padStart(19) : 'N/A'.padStart(19);
          log(`│ ${name} │ ${kennytm} │ ${rust} │ ${fast} │`);
        });
        
        log('└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘');
        
        // 验证状态
        log('\n✅ 验证状态:', 'bright');
        report.test_cases.forEach(tc => {
          const kennytmValid = tc.kennytm?.valid ? '✅' : '❌';
          const rustValid = tc.qrcode_rust?.valid ? '✅' : tc.qrcode_rust?.valid === false ? '❌' : '⚠️';
          const fastValid = tc.qrcode_fast?.valid ? '✅' : tc.qrcode_fast?.valid === false ? '❌' : '⚠️';
          log(`  ${tc.name || 'Unknown'}: kennytm=${kennytmValid} rust=${rustValid} fast=${fastValid}`);
        });
      }
    } catch (e) {
      log('   (无法解析报告)', 'yellow');
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const quickMode = args.includes('--quick');
  const skipBuild = args.includes('--skip-build');
  
  logSection('Rust QRCode 性能基准测试');
  log('对比包:', 'cyan');
  log('  - kennytm-qrcode (社区参考)');
  log('  - @veaba/qrcode-rust');
  log('  - @veaba/qrcode-fast');
  
  // 检查 cargo
  if (!checkCargo()) {
    log('❌ 未找到 Cargo，请安装 Rust', 'red');
    process.exit(1);
  }
  
  ensureOutputDir();
  
  // 构建
  if (!skipBuild) {
    const built = buildRustTools();
    if (!built) {
      process.exit(1);
    }
  } else {
    log('⏩ 跳过构建 (--skip-build)', 'yellow');
  }
  
  // 运行测试
  const success = await runBenchmark(quickMode);
  
  if (success) {
    showResults();
    
    log('\n📁 输出位置:', 'cyan');
    log(`  - SVG 文件: docs/bench/benchmark-output/`);
    log(`  - JSON 报告: docs/public/benchmark_svg_rust.json`);
    
    log('\n💡 提示:', 'cyan');
    log('  - 使用浏览器打开 SVG 文件查看生成的二维码');
    log('  - 使用手机扫描验证二维码可扫描性');
    log('  - 查看 docs/public/benchmark_svg_rust.json 获取详细数据');
  }
  
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
