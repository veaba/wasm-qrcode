/**
 * @veaba/qrcode-ts 基准测试
 * 使用 Bun 直接运行 TypeScript
 */

import { QRCode, generateBatchQRCodes, generateQRCodeAsync } from '../src/index';
import { QRErrorCorrectLevel } from '@veaba/qrcode-shared';

interface BenchmarkResult {
  name: string;
  ops: number;
  time: number;
  avgTime: number;
  memoryDelta?: number;
}

interface BenchmarkSuite {
  name: string;
  description: string;
  results: BenchmarkResult[];
  timestamp: string;
  bunVersion: string;
}

// 测试配置
const CONFIG = {
  warmupRuns: 10,
  benchmarkRuns: 1000,
  batchSizes: [10, 100, 1000],
};

// 测试数据
const TEST_TEXTS = {
  short: 'https://example.com',
  medium: 'https://github.com/veaba/wasm-qrcode',
  long: 'https://example.com/very/long/path/with/many/parameters?foo=bar&baz=qux&key=value&another=parameter',
  unicode: 'https://例子.com/测试路径?参数=值',
};

/**
 * 测量内存使用
 */
function measureMemory(): number {
  if (typeof Bun !== 'undefined' && (Bun as any).gc) {
    (Bun as any).gc(true);
  }
  return process.memoryUsage().heapUsed;
}

/**
 * 运行单次基准测试
 */
function runBenchmark(
  name: string,
  fn: () => void,
  runs: number
): BenchmarkResult {
  // 预热
  for (let i = 0; i < CONFIG.warmupRuns; i++) {
    fn();
  }

  // 测量内存前
  const memBefore = measureMemory();

  // 正式测试
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    fn();
  }
  const time = performance.now() - start;

  // 测量内存后
  const memAfter = measureMemory();
  const memoryDelta = memAfter - memBefore;

  return {
    name,
    ops: Math.round((runs / time) * 1000),
    time,
    avgTime: time / runs,
    memoryDelta,
  };
}

/**
 * 单条生成测试
 */
function benchmarkSingleGeneration(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  for (const [type, text] of Object.entries(TEST_TEXTS)) {
    const result = runBenchmark(
      `单条生成 (${type})`,
      () => {
        const qr = new QRCode(text, QRErrorCorrectLevel.H);
        qr.toSVG();
      },
      CONFIG.benchmarkRuns
    );

    results.push(result);
  }

  return results;
}

/**
 * 批量生成测试
 */
function benchmarkBatchGeneration(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];

  for (const batchSize of CONFIG.batchSizes) {
    const texts = Array.from({ length: batchSize }, (_, i) => `https://example.com/item${i}`);

    const result = runBenchmark(
      `批量生成 (${batchSize} 条)`,
      () => {
        generateBatchQRCodes(texts);
      },
      Math.max(10, Math.floor(1000 / batchSize))
    );

    // 调整 ops 计算
    result.ops = Math.round((result.ops * batchSize));
    results.push(result);
  }

  return results;
}

/**
 * 不同输出格式测试
 */
function benchmarkOutputFormats(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const text = TEST_TEXTS.medium;

  // SVG 输出
  const svgResult = runBenchmark(
    'SVG 输出',
    () => {
      const qr = new QRCode(text, QRErrorCorrectLevel.H);
      qr.toSVG();
    },
    CONFIG.benchmarkRuns
  );
  results.push(svgResult);

  // Styled SVG 输出
  const styledResult = runBenchmark(
    'Styled SVG 输出',
    () => {
      const qr = new QRCode(text, QRErrorCorrectLevel.H);
      qr.toStyledSVG({
        colorDark: '#000000',
        colorLight: '#ffffff',
        margin: 4,
      });
    },
    CONFIG.benchmarkRuns
  );
  results.push(styledResult);

  // 获取模块数据
  const modulesResult = runBenchmark(
    '获取模块数据',
    () => {
      const qr = new QRCode(text, QRErrorCorrectLevel.H);
      qr.getModulesJSON();
    },
    CONFIG.benchmarkRuns
  );
  results.push(modulesResult);

  return results;
}

/**
 * 不同纠错级别测试
 */
function benchmarkErrorCorrectionLevels(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
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
        const qr = new QRCode(text, level);
        qr.toSVG();
      },
      CONFIG.benchmarkRuns
    );

    results.push(result);
  }

  return results;
}

/**
 * 异步生成测试
 */
async function benchmarkAsyncGeneration(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  const text = TEST_TEXTS.medium;

  // 预热
  for (let i = 0; i < CONFIG.warmupRuns; i++) {
    await generateQRCodeAsync(text);
  }

  // 异步单条
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    await generateQRCodeAsync(text);
  }
  const asyncTime = performance.now() - start;

  results.push({
    name: '异步单条生成',
    ops: Math.round((100 / asyncTime) * 1000),
    time: asyncTime,
    avgTime: asyncTime / 100,
  });

  return results;
}

/**
 * Bun 特定优化测试
 */
function benchmarkBunOptimizations(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const text = TEST_TEXTS.medium;

  // TextEncoder 测试
  const encoderResult = runBenchmark(
    'TextEncoder 编码',
    () => {
      const encoder = new TextEncoder();
      encoder.encode(text);
    },
    CONFIG.benchmarkRuns * 10
  );
  results.push(encoderResult);

  return results;
}

/**
 * 运行完整基准测试套件
 */
async function runBenchmarks(): Promise<BenchmarkSuite> {
  console.log('🚀 开始 @veaba/qrcode-ts 基准测试...\n');

  const allResults: BenchmarkResult[] = [];

  console.log('📊 测试 1: 单条生成性能');
  allResults.push(...benchmarkSingleGeneration());

  console.log('📊 测试 2: 批量生成性能');
  allResults.push(...benchmarkBatchGeneration());

  console.log('📊 测试 3: 输出格式性能');
  allResults.push(...benchmarkOutputFormats());

  console.log('📊 测试 4: 纠错级别性能');
  allResults.push(...benchmarkErrorCorrectionLevels());

  console.log('📊 测试 5: 异步生成性能');
  allResults.push(...await benchmarkAsyncGeneration());

  console.log('📊 测试 6: Bun 优化测试');
  allResults.push(...benchmarkBunOptimizations());

  const suite: BenchmarkSuite = {
    name: '@veaba/qrcode-ts',
    description: 'Bun QRCode 生成性能测试',
    results: allResults,
    timestamp: new Date().toISOString(),
    bunVersion: (Bun as any).version || 'unknown',
  };

  console.log('\n✅ 基准测试完成!\n');
  printResults(suite);

  return suite;
}

/**
 * 打印结果
 */
function printResults(suite: BenchmarkSuite): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 ${suite.name}`);
  console.log(`📝 ${suite.description}`);
  console.log(`⏰ ${suite.timestamp}`);
  console.log(`🥟 Bun ${suite.bunVersion}`);
  console.log(`${'='.repeat(60)}\n`);

  for (const result of suite.results) {
    console.log(`${result.name}:`);
    console.log(`  ⚡ ${result.ops.toLocaleString()} ops/s`);
    console.log(`  ⏱️  ${result.avgTime.toFixed(4)} ms/op`);
    if (result.memoryDelta !== undefined) {
      console.log(`  💾 ${(result.memoryDelta / 1024).toFixed(2)} KB`);
    }
    console.log();
  }
}

/**
 * 导出结果为 JSON
 */
function exportResults(suite: BenchmarkSuite): string {
  return JSON.stringify(suite, null, 2);
}

// 运行测试
runBenchmarks().then(suite => {
  const outputPath = './benchmark_result.json';
  Bun.write(outputPath, exportResults(suite));
  console.log(`\n💾 结果已保存到: ${outputPath}`);
}).catch(console.error);
