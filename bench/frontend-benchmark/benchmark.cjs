/**
 * 前端包基准测试 (Node.js 环境)
 * 使用 CommonJS 直接运行
 */

const fs = require('fs');
const path = require('path');

// 测试配置
const CONFIG = {
  warmupRuns: 10,
  benchmarkRuns: 1000,
  batchSizes: [10, 100, 1000],
};

// 测试数据
const TEST_TEXTS = {
  short: 'https://example.com',
  medium: 'https://github.com/veaba/qrcodes',
  long: 'https://example.com/very/long/path/with/many/parameters?foo=bar&baz=qux&key=value&another=parameter',
  unicode: 'https://例子.com/测试路径?参数=值',
};

// 导入 QRCode
const { QRCodeCore, QRErrorCorrectLevel } = require('../../packages/qrcode-js/dist/index.js');

/**
 * 运行单次基准测试
 */
function runBenchmark(name, fn, runs) {
  // 预热
  for (let i = 0; i < CONFIG.warmupRuns; i++) {
    fn();
  }

  // 正式测试
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    fn();
  }
  const time = performance.now() - start;

  return {
    name,
    ops: Math.round((runs / time) * 1000),
    time,
    avgTime: time / runs,
  };
}

/**
 * 测试 @veaba/qrcode-js
 */
function benchmarkJS() {
  console.log('🚀 测试 @veaba/qrcode-js...');
  
  const results = [];
  
  // 单条生成测试
  console.log('  📊 单条生成性能...');
  for (const [type, text] of Object.entries(TEST_TEXTS)) {
    const result = runBenchmark(
      `单条生成 (${type})`,
      () => {
        const qr = new QRCodeCore(text, QRErrorCorrectLevel.H);
        qr.toSVG();
      },
      CONFIG.benchmarkRuns
    );
    results.push(result);
    console.log(`    ${type}: ${result.ops.toLocaleString()} ops/s`);
  }
  
  // 批量生成测试
  console.log('  📊 批量生成性能...');
  const texts = Array.from({ length: 100 }, (_, i) => `https://example.com/item${i}`);
  for (const batchSize of CONFIG.batchSizes) {
    const batchTexts = texts.slice(0, batchSize);
    const result = runBenchmark(
      `批量生成 (${batchSize} 条)`,
      () => {
        for (const text of batchTexts) {
          const qr = new QRCodeCore(text, QRErrorCorrectLevel.H);
          qr.toSVG();
        }
      },
      Math.max(10, Math.floor(1000 / batchSize))
    );
    result.ops = Math.round(result.ops * batchSize);
    results.push(result);
    console.log(`    ${batchSize} 条: ${result.ops.toLocaleString()} ops/s`);
  }
  
  // 不同纠错级别测试
  console.log('  📊 纠错级别性能...');
  const text = TEST_TEXTS.medium;
  const levels = [
    { name: 'L (低)', level: QRErrorCorrectLevel.L },
    { name: 'M (中)', level: QRErrorCorrectLevel.M },
    { name: 'Q (较高)', level: QRErrorCorrectLevel.Q },
    { name: 'H (高)', level: QRErrorCorrectLevel.H },
  ];
  
  for (const { name, level } of levels) {
    const result = runBenchmark(
      `纠错级别 ${name}`,
      () => {
        const qr = new QRCodeCore(text, level);
        qr.toSVG();
      },
      CONFIG.benchmarkRuns
    );
    results.push(result);
    console.log(`    ${name}: ${result.ops.toLocaleString()} ops/s`);
  }
  
  return results;
}

/**
 * 打印结果
 */
function printResults(suite) {
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 前端包基准测试结果');
  console.log(`⏰ ${suite.timestamp}`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`📦 ${suite.js.name} v${suite.js.version}`);
  console.log(`   平台: ${suite.environment.platform}`);
  console.log(`   Node.js: ${suite.environment.nodeVersion}\n`);
  
  console.log('性能结果:\n');
  
  // 按类别分组
  const categories = {
    '单条生成': suite.js.results.filter(r => r.name.startsWith('单条生成')),
    '批量生成': suite.js.results.filter(r => r.name.startsWith('批量生成')),
    '纠错级别': suite.js.results.filter(r => r.name.startsWith('纠错级别')),
  };
  
  for (const [category, results] of Object.entries(categories)) {
    if (results.length > 0) {
      console.log(`${category}:`);
      for (const result of results) {
        console.log(`  ${result.name}: ${result.ops.toLocaleString()} ops/s (${result.avgTime.toFixed(4)} ms/op)`);
      }
      console.log();
    }
  }
  
  console.log(`${'='.repeat(70)}\n`);
  console.log(`💡 ${suite.note}\n`);
}

/**
 * 运行完整前端基准测试
 */
function runFrontendBenchmark() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║           🚀 前端 QRCode 包基准测试套件                              ║');
  console.log('║           Frontend QRCode Package Benchmark Suite                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  
  const suite = {
    timestamp: new Date().toISOString(),
    environment: {
      platform: process.platform,
      nodeVersion: process.version,
    },
    js: {
      name: '@veaba/qrcode-js',
      version: '1.0.0',
      results: [],
    },
    note: '@veaba/qrcode-wasm 需要在浏览器环境中测试，请运行 pnpm run test:browser',
  };
  
  // 测试 JS 包
  console.log('─'.repeat(70));
  console.log('🟨 测试 @veaba/qrcode-js (TypeScript 实现)');
  console.log('─'.repeat(70) + '\n');
  suite.js.results = benchmarkJS();
  
  // 打印结果
  printResults(suite);
  
  // 保存结果
  const outputPath = path.join(__dirname, 'frontend_benchmark_result.json');
  fs.writeFileSync(outputPath, JSON.stringify(suite, null, 2));
  console.log(`💾 结果已保存到: ${outputPath}\n`);
  
  // 同时保存到 public 目录
  const publicDir = path.join(__dirname, '../../docs/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'frontend_benchmark_result.json');
  fs.writeFileSync(publicPath, JSON.stringify(suite, null, 2));
  console.log(`💾 结果已复制到: ${publicPath}\n`);
}

// 运行基准测试
runFrontendBenchmark();
