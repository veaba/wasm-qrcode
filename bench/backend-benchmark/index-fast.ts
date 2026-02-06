/**
 * 快速 PK 基准测试 - 使用缓存的 Rust 结果
 * 对比 @veaba/qrcode-node、@veaba/qrcode-bun、@veaba/qrcode-fast、@veaba/qrcode-rust
 * 以及外部包 bench/kennytm-qrcode
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 测试配置
const CONFIG = {
  outputDir: path.join(__dirname, '../../docs/public'),
};

// 包信息
const PACKAGES = {
  node: {
    name: '@veaba/qrcode-node',
    description: 'Node.js QRCode 实现',
    color: '#339933',
    icon: '🟢',
  },
  bun: {
    name: '@veaba/qrcode-bun',
    description: 'Bun QRCode 实现',
    color: '#fbf0df',
    icon: '🥟',
  },
  fast: {
    name: '@veaba/qrcode-fast',
    description: 'Rust 优化版 QRCode',
    color: '#dea584',
    icon: '⚡',
  },
  rust: {
    name: '@veaba/qrcode-rust',
    description: 'Rust QRCode 实现',
    color: '#dea584',
    icon: '🦀',
  },
  kennytm: {
    name: 'kennytm-qrcode',
    description: '社区流行的 Rust QRCode',
    color: '#6b7280',
    icon: '📦',
  },
};

interface BenchmarkResult {
  name: string;
  ops: number;
  avgTime: number;
  category: 'single' | 'batch' | 'svg' | 'error_level';
}

interface PackageResult {
  packageName: string;
  version: string;
  runtime: string;
  runtimeVersion: string;
  results: BenchmarkResult[];
}

interface PKBenchmarkSuite {
  timestamp: string;
  environment: {
    platform: string;
    cpu: string;
    nodeVersion?: string;
    bunVersion?: string;
    rustVersion?: string;
  };
  packages: PackageResult[];
  comparison: ComparisonResult[];
}

interface ComparisonResult {
  testName: string;
  category: string;
  results: {
    package: string;
    ops: number;
    avgTime: number;
    rank: number;
  }[];
  winner: string;
  speedup: number;
}

// 从之前运行的结果中读取 qrcode-fast 数据
// 使用标准化的测试名称以便跨包对比
function getFastResults(): BenchmarkResult[] {
  return [
    { name: '单条生成 (short)', ops: 54283, avgTime: 18.42, category: 'single' },
    { name: '单条生成 (medium)', ops: 38696, avgTime: 25.84, category: 'single' },
    { name: '单条生成 (long)', ops: 9303, avgTime: 107.49, category: 'single' },
    { name: '批量生成 (100 条)', ops: 439, avgTime: 2278.7, category: 'batch' },
    { name: 'SVG 输出', ops: 92486, avgTime: 10.81, category: 'svg' },
    { name: '纠错级别 L (低)', ops: 61368, avgTime: 16.30, category: 'error_level' },
    { name: '纠错级别 M (中)', ops: 41950, avgTime: 23.84, category: 'error_level' },
    { name: '纠错级别 Q (较高)', ops: 49062, avgTime: 20.38, category: 'error_level' },
    { name: '纠错级别 H (高)', ops: 47436, avgTime: 21.08, category: 'error_level' },
  ];
}

// qrcode-rust 的缓存数据（来自 comparison_bench）
// 实际运行时间: 2026-02-02
function getRustResults(): BenchmarkResult[] {
  return [
    { name: '单条生成 (short)', ops: 21635, avgTime: 46.22, category: 'single' },
    { name: '单条生成 (medium)', ops: 10135, avgTime: 98.66, category: 'single' },
    { name: '单条生成 (long)', ops: 4803, avgTime: 208.18, category: 'single' },
    { name: '批量生成 (100 条)', ops: 192, avgTime: 5201.8, category: 'batch' },
    { name: 'SVG 输出', ops: 20966, avgTime: 47.70, category: 'svg' },
    { name: '纠错级别 L (低)', ops: 24678, avgTime: 40.52, category: 'error_level' },
    { name: '纠错级别 M (中)', ops: 25014, avgTime: 39.98, category: 'error_level' },
    { name: '纠错级别 Q (较高)', ops: 18398, avgTime: 54.35, category: 'error_level' },
    { name: '纠错级别 H (高)', ops: 16720, avgTime: 59.81, category: 'error_level' },
  ];
}

// kennytm-qrcode 的缓存数据（来自 comparison_bench）
// 注意: kennytm 的 "SVG 输出" 实际生成的是字符矩阵，不是 SVG 字符串
// 实际运行时间: 2026-02-02
function getKennytmResults(): BenchmarkResult[] {
  return [
    { name: '单条生成 (short)', ops: 3998, avgTime: 250.11, category: 'single' },
    { name: '单条生成 (medium)', ops: 1655, avgTime: 604.18, category: 'single' },
    { name: '单条生成 (long)', ops: 861, avgTime: 1161.20, category: 'single' },
    { name: '批量生成 (100 条)', ops: 20, avgTime: 51134.0, category: 'batch' },
    { name: 'SVG 输出', ops: 153827, avgTime: 6.50, category: 'svg' },
    { name: '纠错级别 L (低)', ops: 1847, avgTime: 541.45, category: 'error_level' },
    { name: '纠错级别 M (中)', ops: 1864, avgTime: 536.45, category: 'error_level' },
    { name: '纠错级别 Q (较高)', ops: 2300, avgTime: 434.81, category: 'error_level' },
    { name: '纠错级别 H (高)', ops: 1583, avgTime: 631.65, category: 'error_level' },
  ];
}

/**
 * 内联 Node.js 基准测试配置和数据
 */
const NODE_CONFIG = {
  warmupRuns: 10,
  benchmarkRuns: 1000,
  batchSizes: [10, 100, 1000],
};

const NODE_TEST_TEXTS = {
  short: 'https://example.com',
  medium: 'https://github.com/veaba/qrcodes',
  long: 'https://example.com/very/long/path/with/many/parameters?foo=bar&baz=qux&key=value&another=parameter',
  unicode: 'https://例子.com/测试路径?参数=值',
};

interface NodeBenchmarkResult {
  name: string;
  ops: number;
  time: number;
  avgTime: number;
  memoryDelta?: number;
}

/**
 * 运行 Node.js 基准测试
 * 直接在 backend-benchmark 中执行，不依赖外部文件
 */
async function benchmarkNode(): Promise<PackageResult | null> {
  try {
    console.log('🟢 测试 @veaba/qrcode-node...');

    const nodePkgPath = path.join(__dirname, '../../packages/qrcode-node/dist/index.js');
    let QRCode: any, generateBatchQRCodes: any;
    let QRErrorCorrectLevel: any;

    try {
      const module = await import(nodePkgPath);
      QRCode = module.QRCode;
      generateBatchQRCodes = module.generateBatchQRCodes;
      QRErrorCorrectLevel = module.QRErrorCorrectLevel;
    } catch (importError) {
      console.log('  ⚠️ 无法导入 @veaba/qrcode-node 模块，可能需要先构建');
      return null;
    }

    if (!QRCode) {
      console.log('  ⚠️ QRCode 类未找到');
      return null;
    }

    const results: NodeBenchmarkResult[] = [];

    const measureMemory = (): number => {
      if (global.gc) (global as any).gc();
      return process.memoryUsage().heapUsed;
    };

    const runBenchmark = (name: string, fn: () => void, runs: number): NodeBenchmarkResult => {
      for (let i = 0; i < NODE_CONFIG.warmupRuns; i++) fn();

      const memBefore = measureMemory();
      const start = performance.now();
      for (let i = 0; i < runs; i++) fn();
      const time = performance.now() - start;
      const memAfter = measureMemory();

      return {
        name,
        ops: Math.round((runs / time) * 1000),
        time,
        avgTime: time / runs,
        memoryDelta: memAfter - memBefore,
      };
    };

    console.log('  📊 测试单条生成性能...');
    for (const [type, text] of Object.entries(NODE_TEST_TEXTS)) {
      const result = runBenchmark(
        `单条生成 (${type})`,
        () => {
          const qr = new QRCode(text, QRErrorCorrectLevel.H);
          qr.toSVG();
        },
        NODE_CONFIG.benchmarkRuns
      );
      results.push(result);
    }

    console.log('  📊 测试批量生成性能...');
    for (const batchSize of NODE_CONFIG.batchSizes) {
      const texts = Array.from({ length: batchSize }, (_, i) => `https://example.com/item${i}`);
      const result = runBenchmark(
        `批量生成 (${batchSize} 条)`,
        () => generateBatchQRCodes(texts),
        Math.max(10, Math.floor(1000 / batchSize))
      );
      result.ops = Math.round(result.ops * batchSize);
      results.push(result);
    }

    console.log('  📊 测试 SVG 输出...');
    const text = NODE_TEST_TEXTS.medium;
    {
      const result = runBenchmark(
        'SVG 输出',
        () => {
          const qr = new QRCode(text, QRErrorCorrectLevel.H);
          qr.toSVG();
        },
        NODE_CONFIG.benchmarkRuns
      );
      results.push(result);
    }

    return {
      packageName: PACKAGES.node.name,
      version: '1.0.0',
      runtime: 'Node.js',
      runtimeVersion: process.version,
      results: results.map((r) => ({
        name: r.name,
        ops: r.ops,
        avgTime: r.avgTime * 1000,
        category: categorizeTest(r.name),
      })),
    };
  } catch (error) {
    console.error('  ❌ Node.js 基准测试失败:', error);
    return null;
  }
}

/**
 * 内联 Bun 基准测试配置和数据
 */
const BUN_CONFIG = {
  warmupRuns: 10,
  benchmarkRuns: 1000,
  batchSizes: [10, 100, 1000],
};

const BUN_TEST_TEXTS = {
  short: 'https://example.com',
  medium: 'https://github.com/veaba/qrcodes',
  long: 'https://example.com/very/long/path/with/many/parameters?foo=bar&baz=qux&key=value&another=parameter',
  unicode: 'https://例子.com/测试路径?参数=值',
};

interface BunBenchmarkResult {
  name: string;
  ops: number;
  time: number;
  avgTime: number;
  memoryDelta?: number;
}

/**
 * 运行 Bun 基准测试
 * 直接在 backend-benchmark 中执行，不依赖外部文件
 */
async function benchmarkBun(): Promise<PackageResult | null> {
  try {
    console.log('🥟 测试 @veaba/qrcode-bun...');

    // 检查是否安装了 Bun
    let bunVersion: string;
    try {
      bunVersion = execSync('bun --version', { stdio: 'pipe', encoding: 'utf-8' }).trim();
    } catch {
      console.log('  ⚠️ Bun 未安装，跳过测试');
      return null;
    }

    // 动态导入 qrcode-bun 模块
    const bunPkgPath = path.join(__dirname, '../../packages/qrcode-bun/src/index.ts');
    let QRCode: any, generateBatchQRCodes: any;

    try {
      const module = await import(bunPkgPath);
      QRCode = module.QRCode;
      generateBatchQRCodes = module.generateBatchQRCodes;
    } catch (importError) {
      console.log('  ⚠️ 无法导入 @veaba/qrcode-bun 模块，可能需要在 Bun 环境下运行');
      return null;
    }

    if (!QRCode) {
      console.log('  ⚠️ QRCode 类未找到');
      return null;
    }

    const results: BunBenchmarkResult[] = [];

    // 测试 1: 单条生成性能
    console.log('  📊 测试单条生成性能...');
    for (const [type, text] of Object.entries(BUN_TEST_TEXTS)) {
      for (let i = 0; i < BUN_CONFIG.warmupRuns; i++) {
        const qr = new QRCode(text);
        qr.toSVG();
      }

      const start = performance.now();
      for (let i = 0; i < BUN_CONFIG.benchmarkRuns; i++) {
        const qr = new QRCode(text);
        qr.toSVG();
      }
      const time = performance.now() - start;

      results.push({
        name: `单条生成 (${type})`,
        ops: Math.round((BUN_CONFIG.benchmarkRuns / time) * 1000),
        time,
        avgTime: time / BUN_CONFIG.benchmarkRuns,
      });
    }

    // 测试 2: 批量生成性能
    console.log('  📊 测试批量生成性能...');
    for (const batchSize of BUN_CONFIG.batchSizes) {
      const texts = Array.from({ length: batchSize }, (_, i) => `https://example.com/item${i}`);

      for (let i = 0; i < BUN_CONFIG.warmupRuns; i++) {
        generateBatchQRCodes(texts);
      }

      const runs = Math.max(10, Math.floor(1000 / batchSize));
      const start = performance.now();
      for (let i = 0; i < runs; i++) {
        generateBatchQRCodes(texts);
      }
      const time = performance.now() - start;

      results.push({
        name: `批量生成 (${batchSize} 条)`,
        ops: Math.round((runs * batchSize / time) * 1000),
        time,
        avgTime: time / runs,
      });
    }

    // 测试 3: SVG 输出
    console.log('  📊 测试 SVG 输出...');
    const text = BUN_TEST_TEXTS.medium;
    {
      for (let i = 0; i < BUN_CONFIG.warmupRuns; i++) {
        const qr = new QRCode(text);
        qr.toSVG();
      }

      const start = performance.now();
      for (let i = 0; i < BUN_CONFIG.benchmarkRuns; i++) {
        const qr = new QRCode(text);
        qr.toSVG();
      }
      const time = performance.now() - start;

      results.push({
        name: 'SVG 输出',
        ops: Math.round((BUN_CONFIG.benchmarkRuns / time) * 1000),
        time,
        avgTime: time / BUN_CONFIG.benchmarkRuns,
      });
    }

    return {
      packageName: PACKAGES.bun.name,
      version: '1.0.0',
      runtime: 'Bun',
      runtimeVersion: bunVersion,
      results: results.map((r) => ({
        name: r.name,
        ops: r.ops,
        avgTime: r.avgTime * 1000,
        category: categorizeTest(r.name),
      })),
    };
  } catch (error) {
    console.error('  ❌ Bun 基准测试失败:', error);
    return null;
  }
}

/**
 * 获取 qrcode-fast 结果
 */
async function benchmarkFast(): Promise<PackageResult | null> {
  try {
    console.log('⚡ 测试 @veaba/qrcode-fast (使用缓存结果)...');

    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch { }

    return {
      packageName: PACKAGES.fast.name,
      version: '1.0.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results: getFastResults(),
    };
  } catch (error) {
    console.error('  ❌ qrcode-fast 基准测试失败:', error);
    return null;
  }
}

/**
 * 获取 qrcode-rust 结果
 */
async function benchmarkRust(): Promise<PackageResult | null> {
  try {
    console.log('🦀 测试 @veaba/qrcode-rust (使用缓存结果)...');

    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch { }

    return {
      packageName: PACKAGES.rust.name,
      version: '1.0.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results: getRustResults(),
    };
  } catch (error) {
    console.error('  ❌ qrcode-rust 基准测试失败:', error);
    return null;
  }
}

/**
 * 获取 kennytm-qrcode 结果
 */
async function benchmarkKennytm(): Promise<PackageResult | null> {
  try {
    console.log('📦 测试 kennytm-qrcode (使用缓存结果)...');

    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch { }

    return {
      packageName: PACKAGES.kennytm.name,
      version: '0.14.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results: getKennytmResults(),
    };
  } catch (error) {
    console.error('  ❌ kennytm-qrcode 基准测试失败:', error);
    return null;
  }
}

/**
 * 分类测试名称
 */
function categorizeTest(name: string): BenchmarkResult['category'] {
  const lower = name.toLowerCase();
  if (lower.includes('batch')) return 'batch';
  if (lower.includes('svg')) return 'svg';
  if (lower.includes('error') || lower.includes('level')) return 'error_level';
  return 'single';
}

/**
 * 生成对比结果
 */
function generateComparison(packages: PackageResult[]): ComparisonResult[] {
  const comparisons: ComparisonResult[] = [];

  // 获取所有测试名称
  const allTestNames = new Set<string>();
  for (const pkg of packages) {
    for (const r of pkg.results) {
      allTestNames.add(r.name);
    }
  }

  // 对每个测试进行对比
  for (const testName of allTestNames) {
    const testResults: ComparisonResult['results'] = [];

    for (const pkg of packages) {
      const result = pkg.results.find(r => r.name === testName);
      if (result) {
        testResults.push({
          package: pkg.packageName,
          ops: result.ops,
          avgTime: result.avgTime,
          rank: 0,
        });
      }
    }

    if (testResults.length === 0) continue;

    testResults.sort((a, b) => b.ops - a.ops);
    testResults.forEach((r, i) => { r.rank = i + 1; });

    const fastest = testResults[0];
    const slowest = testResults[testResults.length - 1];
    const speedup = slowest.ops > 0 ? fastest.ops / slowest.ops : 1;

    const category = packages
      .flatMap(p => p.results)
      .find(r => r.name === testName)?.category || 'single';

    comparisons.push({
      testName,
      category,
      results: testResults,
      winner: fastest.package,
      speedup,
    });
  }

  comparisons.sort((a, b) => {
    const catOrder = { single: 0, batch: 1, svg: 2, error_level: 3 };
    if (catOrder[a.category] !== catOrder[b.category]) {
      return catOrder[a.category] - catOrder[b.category];
    }
    return a.testName.localeCompare(b.testName);
  });

  return comparisons;
}

/**
 * 打印对比结果
 */
function printResults(suite: PKBenchmarkSuite): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 后端 QRCode 包 PK 基准测试结果');
  console.log(`⏰ ${suite.timestamp}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('🖥️  测试环境:');
  console.log(`   平台: ${suite.environment.platform}`);
  if (suite.environment.nodeVersion) {
    console.log(`   Node.js: ${suite.environment.nodeVersion}`);
  }
  if (suite.environment.bunVersion) {
    console.log(`   Bun: ${suite.environment.bunVersion}`);
  }
  if (suite.environment.rustVersion) {
    console.log(`   Rust: ${suite.environment.rustVersion}`);
  }
  console.log();

  console.log('📦 参与测试的包:');
  for (const pkg of suite.packages) {
    const icon = Object.values(PACKAGES).find(p => p.name === pkg.packageName)?.icon || '📦';
    console.log(`   ${icon} ${pkg.packageName} (${pkg.runtime} ${pkg.runtimeVersion})`);
  }
  console.log();

  console.log(`${'─'.repeat(80)}`);
  console.log('🏆 对比结果\n');

  let currentCategory = '';
  const categoryNames = {
    single: '📝 单条生成',
    batch: '📚 批量生成',
    svg: '🎨 SVG 生成',
    error_level: '🔧 纠错级别',
  };

  for (const comp of suite.comparison) {
    if (comp.category !== currentCategory) {
      currentCategory = comp.category;
      console.log(`\n${categoryNames[comp.category] || comp.category}:`);
    }

    console.log(`\n  ${comp.testName}:`);
    for (const result of comp.results) {
      const icon = result.rank === 1 ? '🏆' : `  ${result.rank}`;
      const pkg = Object.values(PACKAGES).find(p => p.name === result.package);
      const pkgIcon = pkg?.icon || '📦';
      console.log(`    ${icon} ${pkgIcon} ${result.package}`);
      console.log(`       ${result.ops.toLocaleString()} ops/s | ${result.avgTime.toFixed(2)} µs/op`);
    }
    console.log(`    📈 速度提升: ${comp.speedup.toFixed(2)}x`);
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

/**
 * 保存结果到 JSON 文件
 */
function saveResults(suite: PKBenchmarkSuite): void {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const outputPath = path.join(CONFIG.outputDir, 'backend_benchmark_pk.json');
  fs.writeFileSync(outputPath, JSON.stringify(suite, null, 2));
  console.log(`💾 结果已保存到: ${outputPath}`);

  const summary = {
    timestamp: suite.timestamp,
    environment: suite.environment,
    summary: suite.comparison.map(c => ({
      testName: c.testName,
      category: c.category,
      winner: c.winner,
      speedup: c.speedup,
      top3: c.results.slice(0, 3).map(r => ({
        package: r.package,
        ops: r.ops,
        avgTime: r.avgTime,
      })),
    })),
  };

  const summaryPath = path.join(CONFIG.outputDir, 'backend_benchmark_pk_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`💾 摘要已保存到: ${summaryPath}`);
}

/**
 * 运行完整的 PK 基准测试
 */
async function runPKBenchmark(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           🚀 后端 QRCode 包 PK 基准测试套件（快速版）                        ║');
  console.log('║           Backend QRCode Package PK Benchmark Suite (Fast)                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const suite: PKBenchmarkSuite = {
    timestamp: new Date().toISOString(),
    environment: {
      platform: process.platform,
      cpu: process.arch,
      nodeVersion: process.version,
    },
    packages: [],
    comparison: [],
  };

  console.log('─'.repeat(80));
  console.log('开始运行各包基准测试...\n');

  const nodeResult = await benchmarkNode();
  if (nodeResult) suite.packages.push(nodeResult);

  const bunResult = await benchmarkBun();
  if (bunResult) {
    suite.packages.push(bunResult);
    suite.environment.bunVersion = bunResult.runtimeVersion;
  }

  const fastResult = await benchmarkFast();
  if (fastResult) {
    suite.packages.push(fastResult);
    suite.environment.rustVersion = fastResult.runtimeVersion;
  }

  const rustResult = await benchmarkRust();
  if (rustResult) {
    suite.packages.push(rustResult);
    if (!suite.environment.rustVersion) {
      suite.environment.rustVersion = rustResult.runtimeVersion;
    }
  }

  const kennytmResult = await benchmarkKennytm();
  if (kennytmResult) suite.packages.push(kennytmResult);

  console.log('\n─'.repeat(80));
  console.log('生成对比结果...\n');
  suite.comparison = generateComparison(suite.packages);

  printResults(suite);

  console.log('─'.repeat(80));
  saveResults(suite);

  console.log('\n✅ 基准测试完成！\n');
}

runPKBenchmark().catch(console.error);
