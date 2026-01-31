/**
 * @veaba/qrcode-wasm 基准测试
 * 测试 WASM 绑定的性能
 */

import { QRCode } from '../pkg/qrcode_wasm';

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
function measureMemory(): number | undefined {
  if (globalThis.performance && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return undefined;
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
  const memoryDelta = memBefore && memAfter ? memAfter - memBefore : undefined;

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
    const qr = new QRCode();
    
    const result = runBenchmark(
      `单条生成 (${type})`,
      () => {
        qr.make_code(text);
        qr.get_svg();
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
  const texts = Array.from({ length: 100 }, (_, i) => `https://example.com/item${i}`);

  for (const batchSize of CONFIG.batchSizes) {
    const batchTexts = texts.slice(0, batchSize);
    const qr = new QRCode();

    const result = runBenchmark(
      `批量生成 (${batchSize} 条)`,
      () => {
        for (const text of batchTexts) {
          qr.make_code(text);
          qr.get_svg();
        }
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
 * 实例复用测试
 */
function benchmarkInstanceReuse(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const text = TEST_TEXTS.medium;

  // 不复用实例
  const noReuseResult = runBenchmark(
    '不复用实例',
    () => {
      const qr = new QRCode();
      qr.make_code(text);
      qr.get_svg();
    },
    CONFIG.benchmarkRuns
  );
  results.push(noReuseResult);

  // 复用实例
  const qr = new QRCode();
  const reuseResult = runBenchmark(
    '复用实例',
    () => {
      qr.make_code(text);
      qr.get_svg();
    },
    CONFIG.benchmarkRuns
  );
  results.push(reuseResult);

  return results;
}

/**
 * 不同纠错级别测试
 */
function benchmarkErrorCorrectionLevels(): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  const text = TEST_TEXTS.medium;
  const levels = [
    { name: 'L (低)', level: 1 },
    { name: 'M (中)', level: 0 },
    { name: 'Q (较高)', level: 3 },
    { name: 'H (高)', level: 2 },
  ];

  for (const { name, level } of levels) {
    const qr = new QRCode(200, 200, level);
    
    const result = runBenchmark(
      `纠错级别 ${name}`,
      () => {
        qr.make_code(text);
        qr.get_svg();
      },
      CONFIG.benchmarkRuns
    );
    
    results.push(result);
  }

  return results;
}

/**
 * 运行完整基准测试套件
 */
export function runBenchmarks(): BenchmarkSuite {
  console.log('🚀 开始 @veaba/qrcode-wasm 基准测试...\n');

  const allResults: BenchmarkResult[] = [];

  console.log('📊 测试 1: 单条生成性能');
  allResults.push(...benchmarkSingleGeneration());

  console.log('📊 测试 2: 批量生成性能');
  allResults.push(...benchmarkBatchGeneration());

  console.log('📊 测试 3: 实例复用性能');
  allResults.push(...benchmarkInstanceReuse());

  console.log('📊 测试 4: 纠错级别性能');
  allResults.push(...benchmarkErrorCorrectionLevels());

  const suite: BenchmarkSuite = {
    name: '@veaba/qrcode-wasm',
    description: 'WASM QRCode 生成性能测试',
    results: allResults,
    timestamp: new Date().toISOString(),
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
export function exportResults(suite: BenchmarkSuite): string {
  return JSON.stringify(suite, null, 2);
}

// 如果在浏览器中直接运行
if (typeof window !== 'undefined') {
  (window as any).runQRCodeBenchmarks = runBenchmarks;
  (window as any).exportQRCodeBenchmarks = exportResults;
}

// 如果在 Node.js 中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runBenchmarks, exportResults };
}
