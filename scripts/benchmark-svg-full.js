#!/usr/bin/env node

/**
 * 完整的 SVG 生成性能对比测试脚本
 * 
 * 对比以下包：
 * - @veaba/qrcode-node (Node.js)
 * - @veaba/qrcode-bun (Bun)
 * - @veaba/qrcode-fast (Rust)
 * - @veaba/qrcode-rust (Rust)
 * - kennytm-qrcode (社区 Rust 包)
 * 
 * 功能：
 * 1. 生成 SVG
 * 2. 验证二维码可扫描性
 * 3. 对比性能
 * 4. 生成报告
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'benchmark-output');

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

function logSubSection(title) {
  log(`\n📦 ${title}`, 'blue');
  log('-'.repeat(50), 'blue');
}

// 确保输出目录存在
function ensureOutputDir() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

// 检查命令是否存在
function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// 测试数据
const testCases = [
  { name: 'Simple', text: 'Hello World' },
  { name: 'Complex', text: 'Test QR Code 123' },
  { name: 'URL', text: 'https://github.com/veaba/qrcodes' },
  { name: 'Long', text: 'Email: test@example.com | Phone: +1-234-567-8900 | Address: 123 Main St' },
];

// ============================================
// 构建阶段
// ============================================

function buildRustTools() {
  logSubSection('Building Rust Tools');
  const rustToolsDir = path.join(rootDir, 'bench/rust-tools');
  
  try {
    execSync('cargo build --release --features validation', {
      cwd: rustToolsDir,
      stdio: 'inherit'
    });
    log('✅ Rust tools built successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to build Rust tools', 'red');
    return false;
  }
}

function buildNodePackage() {
  logSubSection('Building @veaba/qrcode-node');
  const nodeDir = path.join(rootDir, 'packages/qrcode-node');
  
  try {
    execSync('npm run build', { cwd: nodeDir, stdio: 'inherit' });
    log('✅ Node package built successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to build Node package', 'red');
    return false;
  }
}

function buildBunPackage() {
  logSubSection('Building @veaba/qrcode-bun');
  const bunDir = path.join(rootDir, 'packages/qrcode-bun');
  
  try {
    execSync('bun run build', { cwd: bunDir, stdio: 'inherit' });
    log('✅ Bun package built successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to build Bun package', 'red');
    return false;
  }
}

// ============================================
// 生成和验证函数
// ============================================

async function generateWithRustTools(text, testName) {
  const results = {
    kennytm: null,
    qrcodeRust: null,
    qrcodeFast: null,
  };

  const rustToolsDir = path.join(rootDir, 'bench/rust-tools');

  // 1. kennytm-qrcode
  logSubSection('kennytm-qrcode (Community Reference)');
  try {
    const start = performance.now();
    const output = execSync(
      `cargo run --release --features validation --bin validate-qr -- "${text}" "${outputDir}/${testName}_kennytm.svg"`,
      { cwd: rustToolsDir, encoding: 'utf-8', stdio: 'pipe' }
    );
    const elapsed = performance.now() - start;
    
    const valid = output.includes('✅ 验证通过') || output.includes('验证通过');
    results.kennytm = {
      time: elapsed,
      valid: valid,
      file: `${testName}_kennytm.svg`,
      output: output,
    };
    
    log(`⏱️  Time: ${elapsed.toFixed(2)}ms`, valid ? 'green' : 'red');
    log(`✅ Valid: ${valid}`, valid ? 'green' : 'red');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    results.kennytm = { time: 0, valid: false, error: error.message };
  }

  // 2. @veaba/qrcode-rust and @veaba/qrcode-fast
  logSubSection('@veaba/qrcode-rust & @veaba/qrcode-fast');
  try {
    const start = performance.now();
    const output = execSync(
      `cargo run --release --features validation --bin veaba-qr -- "${text}"`,
      { cwd: rustToolsDir, encoding: 'utf-8', stdio: 'pipe' }
    );
    const elapsed = performance.now() - start;
    
    // Parse output for both packages
    const rustValid = output.includes('@veaba/qrcode-rust') && output.includes('验证通过');
    const fastValid = output.includes('@veaba/qrcode-fast') && output.includes('验证通过');
    
    // Move generated files to output dir
    const files = ['@veaba_qrcode_rust.svg', '@veaba_qrcode_fast.svg'];
    files.forEach(f => {
      const src = path.join(rustToolsDir, f);
      const dst = path.join(outputDir, `${testName}_${f.replace('@veaba_', '').replace('.svg', '')}.svg`);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dst);
      }
    });
    
    results.qrcodeRust = {
      time: elapsed * 0.5, // Approximate split
      valid: rustValid,
      file: `${testName}_qrcode_rust.svg`,
    };
    results.qrcodeFast = {
      time: elapsed * 0.5,
      valid: fastValid,
      file: `${testName}_qrcode_fast.svg`,
    };
    
    log(`⏱️  Total Time: ${elapsed.toFixed(2)}ms`, 'cyan');
    log(`✅ qrcode-rust: ${rustValid}`, rustValid ? 'green' : 'red');
    log(`✅ qrcode-fast: ${fastValid}`, fastValid ? 'green' : 'red');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    results.qrcodeRust = { time: 0, valid: false, error: error.message };
    results.qrcodeFast = { time: 0, valid: false, error: error.message };
  }

  return results;
}

async function generateWithNode(text, testName) {
  logSubSection('@veaba/qrcode-node');
  
  const start = performance.now();
  
  try {
    // Create a temporary test script
    const testScript = `
import { QRCode } from '../packages/qrcode-node/dist/index.js';
import fs from 'fs';

const text = ${JSON.stringify(text)};
const qr = new QRCode(text);
const svg = qr.toSVG(256);
fs.writeFileSync('${outputDir.replace(/\\/g, '\\\\')}/${testName}_qrcode_node.svg', svg);
console.log('SVG_SIZE:', svg.length);
console.log('MODULE_COUNT:', qr.moduleCount);
`;
    
    const scriptPath = path.join(outputDir, '_temp_node_test.js');
    fs.writeFileSync(scriptPath, testScript);
    
    const output = execSync(`node "${scriptPath}"`, { 
      cwd: rootDir, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const elapsed = performance.now() - start;
    
    // Parse output
    const svgSize = output.match(/SVG_SIZE:\s*(\d+)/)?.[1] || '0';
    const moduleCount = output.match(/MODULE_COUNT:\s*(\d+)/)?.[1] || '0';
    
    // Clean up
    fs.unlinkSync(scriptPath);
    
    // Note: Node.js package doesn't have built-in validation
    // We would need to use a separate validation tool
    
    log(`⏱️  Time: ${elapsed.toFixed(2)}ms`, 'cyan');
    log(`📄 SVG Size: ${svgSize} bytes`, 'blue');
    log(`📐 Modules: ${moduleCount}x${moduleCount}`, 'blue');
    log(`⚠️  Validation: Not implemented for Node package`, 'yellow');
    
    return {
      time: elapsed,
      valid: null, // Unknown without validation
      file: `${testName}_qrcode_node.svg`,
      svgSize: parseInt(svgSize),
      moduleCount: parseInt(moduleCount),
    };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { time: 0, valid: false, error: error.message };
  }
}

async function generateWithBun(text, testName) {
  logSubSection('@veaba/qrcode-bun');
  
  if (!checkCommand('bun')) {
    log('⚠️  Bun not installed, skipping', 'yellow');
    return { time: 0, valid: null, skipped: true };
  }
  
  const start = performance.now();
  
  try {
    // Create a temporary test script
    const testScript = `
import { QRCode } from '../packages/qrcode-bun/dist/index.js';
import fs from 'fs';

const text = ${JSON.stringify(text)};
const qr = new QRCode(text);
const svg = qr.toSVG(256);
fs.writeFileSync('${outputDir.replace(/\\/g, '\\\\')}/${testName}_qrcode_bun.svg', svg);
console.log('SVG_SIZE:', svg.length);
console.log('MODULE_COUNT:', qr.moduleCount);
`;
    
    const scriptPath = path.join(outputDir, '_temp_bun_test.ts');
    fs.writeFileSync(scriptPath, testScript);
    
    const output = execSync(`bun run "${scriptPath}"`, { 
      cwd: rootDir, 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const elapsed = performance.now() - start;
    
    // Parse output
    const svgSize = output.match(/SVG_SIZE:\s*(\d+)/)?.[1] || '0';
    const moduleCount = output.match(/MODULE_COUNT:\s*(\d+)/)?.[1] || '0';
    
    // Clean up
    fs.unlinkSync(scriptPath);
    
    log(`⏱️  Time: ${elapsed.toFixed(2)}ms`, 'cyan');
    log(`📄 SVG Size: ${svgSize} bytes`, 'blue');
    log(`📐 Modules: ${moduleCount}x${moduleCount}`, 'blue');
    log(`⚠️  Validation: Not implemented for Bun package`, 'yellow');
    
    return {
      time: elapsed,
      valid: null,
      file: `${testName}_qrcode_bun.svg`,
      svgSize: parseInt(svgSize),
      moduleCount: parseInt(moduleCount),
    };
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return { time: 0, valid: false, error: error.message };
  }
}

// ============================================
// 验证函数
// ============================================

async function validateSVG(filePath, expectedText) {
  const rustToolsDir = path.join(rootDir, 'bench/rust-tools');
  
  try {
    // Use the validation library directly
    const output = execSync(
      `cargo run --release --features validation --bin validate-qr -- "${expectedText}" "${filePath}"`,
      { cwd: rustToolsDir, encoding: 'utf-8', stdio: 'pipe' }
    );
    
    return output.includes('✅ 验证通过') || output.includes('验证通过');
  } catch (error) {
    return false;
  }
}

// ============================================
// 报告生成
// ============================================

function generateReport(allResults) {
  logSection('Performance Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    testCases: testCases.map(tc => tc.name),
    results: allResults,
    summary: {},
  };
  
  // Calculate summary
  const packages = ['kennytm', 'qrcodeRust', 'qrcodeFast', 'qrcodeNode', 'qrcodeBun'];
  
  packages.forEach(pkg => {
    const times = [];
    let validCount = 0;
    let totalCount = 0;
    
    allResults.forEach(result => {
      if (result[pkg]) {
        if (result[pkg].time > 0) times.push(result[pkg].time);
        if (result[pkg].valid !== null) {
          totalCount++;
          if (result[pkg].valid) validCount++;
        }
      }
    });
    
    if (times.length > 0) {
      report.summary[pkg] = {
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        validRate: totalCount > 0 ? (validCount / totalCount * 100).toFixed(1) : 'N/A',
      };
    }
  });
  
  // Print summary table
  log('\n📊 Performance Summary (Average Time)', 'bright');
  log('-'.repeat(70), 'bright');
  log(`${'Package'.padEnd(25)} ${'Avg Time'.padStart(12)} ${'Min Time'.padStart(12)} ${'Valid Rate'.padStart(12)}`, 'cyan');
  log('-'.repeat(70), 'bright');
  
  Object.entries(report.summary).forEach(([pkg, data]) => {
    const name = pkg.padEnd(25);
    const avg = `${data.avgTime.toFixed(2)}ms`.padStart(12);
    const min = `${data.minTime.toFixed(2)}ms`.padStart(12);
    const valid = `${data.validRate}%`.padStart(12);
    log(`${name} ${avg} ${min} ${valid}`);
  });
  
  // Save report
  const reportPath = path.join(outputDir, 'benchmark-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportPath}`, 'green');
  
  return report;
}

// ============================================
// 主函数
// ============================================

async function main() {
  logSection('SVG QRCode Benchmark - Full Comparison');
  log('Packages: @veaba/qrcode-node, @veaba/qrcode-bun, @veaba/qrcode-fast, @veaba/qrcode-rust, kennytm-qrcode');
  log('Features: SVG Generation + Validation');
  
  ensureOutputDir();
  
  // Parse arguments
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--skip-build');
  const quickMode = args.includes('--quick');
  const testsToRun = quickMode ? [testCases[0]] : testCases;
  
  // Build phase
  if (!skipBuild) {
    logSection('Build Phase');
    
    const builds = [
      { name: 'Rust Tools', fn: buildRustTools },
      { name: 'Node Package', fn: buildNodePackage },
      { name: 'Bun Package', fn: buildBunPackage },
    ];
    
    for (const build of builds) {
      const success = build.fn();
      if (!success && build.name === 'Rust Tools') {
        log('❌ Critical build failed, exiting', 'red');
        process.exit(1);
      }
    }
  } else {
    log('\n⏩ Skipping build phase (--skip-build)', 'yellow');
  }
  
  // Test phase
  logSection('Test Phase');
  const allResults = [];
  
  for (const testCase of testsToRun) {
    log(`\n${'='.repeat(70)}`, 'bright');
    log(`Test Case: ${testCase.name}`, 'magenta');
    log(`Text: "${testCase.text}"`, 'magenta');
    log(`${'='.repeat(70)}`, 'bright');
    
    const results = {
      testName: testCase.name,
      text: testCase.text,
    };
    
    // Rust tools (kennytm, qrcode-rust, qrcode-fast)
    const rustResults = await generateWithRustTools(testCase.text, testCase.name);
    Object.assign(results, rustResults);
    
    // Node.js
    results.qrcodeNode = await generateWithNode(testCase.text, testCase.name);
    
    // Bun
    results.qrcodeBun = await generateWithBun(testCase.text, testCase.name);
    
    allResults.push(results);
  }
  
  // Generate report
  const report = generateReport(allResults);
  
  // Final summary
  logSection('Final Summary');
  log(`📁 Output directory: ${outputDir}`, 'cyan');
  log(`📊 Generated files:`, 'cyan');
  
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.svg'));
  files.forEach(f => {
    const stats = fs.statSync(path.join(outputDir, f));
    log(`  - ${f} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
  
  log('\n✅ Benchmark complete!', 'green');
  log('\n💡 Next steps:', 'cyan');
  log('  1. Check generated SVGs in: benchmark-output/');
  log('  2. View detailed report: benchmark-output/benchmark-report.json');
  log('  3. Scan SVGs with your phone to verify they work');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
