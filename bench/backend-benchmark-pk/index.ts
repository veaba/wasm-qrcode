/**
 * 后端 QRCode 包 PK 基准测试
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
  warmupRuns: 10,
  benchmarkRuns: 1000,
  batchSizes: [10, 100, 1000],
  outputDir: path.join(__dirname, '../../docs/public'),
};

// 测试数据
const TEST_TEXTS = {
  short: 'https://a.co',
  medium: 'https://github.com/veaba/qrcodes',
  long: 'https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3',
  unicode: 'https://例子.com/测试路径?参数=值',
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
  avgTime: number; // microseconds
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
  speedup: number; // 最快相对于最慢的倍数
}

/**
 * 运行 Node.js 基准测试
 */
async function benchmarkNode(): Promise<PackageResult | null> {
  try {
    console.log('🟢 测试 @veaba/qrcode-node...');
    
    const pkgPath = path.join(__dirname, '../../packages/qrcode-node');
    const benchmarkPath = path.join(pkgPath, 'benchmark/index.js');
    
    // 先运行基准测试
    execSync(`node "${benchmarkPath}"`, { 
      cwd: pkgPath,
      stdio: 'pipe',
      timeout: 60000 
    });
    
    // 读取结果
    const resultPath = path.join(pkgPath, 'benchmark/benchmark_result.json');
    if (!fs.existsSync(resultPath)) {
      console.log('  ⚠️ 未找到基准测试结果文件');
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    
    return {
      packageName: PACKAGES.node.name,
      version: data.version || '1.0.0',
      runtime: 'Node.js',
      runtimeVersion: data.nodeVersion || process.version,
      results: data.results.map((r: any) => ({
        name: r.name,
        ops: r.ops,
        avgTime: r.avgTime * 1000, // convert ms to µs
        category: categorizeTest(r.name),
      })),
    };
  } catch (error) {
    console.error('  ❌ Node.js 基准测试失败:', error);
    return null;
  }
}

/**
 * 运行 Bun 基准测试
 */
async function benchmarkBun(): Promise<PackageResult | null> {
  try {
    console.log('🥟 测试 @veaba/qrcode-bun...');
    
    const pkgPath = path.join(__dirname, '../../packages/qrcode-bun');
    const benchmarkPath = path.join(pkgPath, 'benchmark/index.ts');
    
    // 检查是否安装了 Bun
    try {
      execSync('bun --version', { stdio: 'pipe' });
    } catch {
      console.log('  ⚠️ Bun 未安装，跳过测试');
      return null;
    }
    
    // 运行基准测试
    execSync(`bun run "${benchmarkPath}"`, { 
      cwd: pkgPath,
      stdio: 'pipe',
      timeout: 60000 
    });
    
    // 读取结果
    const resultPath = path.join(pkgPath, 'benchmark_result.json');
    if (!fs.existsSync(resultPath)) {
      console.log('  ⚠️ 未找到基准测试结果文件');
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
    
    return {
      packageName: PACKAGES.bun.name,
      version: data.version || '1.0.0',
      runtime: 'Bun',
      runtimeVersion: data.bunVersion || 'unknown',
      results: data.results.map((r: any) => ({
        name: r.name,
        ops: r.ops,
        avgTime: r.avgTime * 1000, // convert ms to µs
        category: categorizeTest(r.name),
      })),
    };
  } catch (error) {
    console.error('  ❌ Bun 基准测试失败:', error);
    return null;
  }
}

/**
 * 运行 Rust 基准测试 (qrcode-fast)
 * 使用标准化的测试名称以便跨包对比
 */
async function benchmarkFast(): Promise<PackageResult | null> {
  try {
    console.log('⚡ 测试 @veaba/qrcode-fast...');
    
    const pkgPath = path.join(__dirname, '../../packages/qrcode-fast');
    
    // 检查包是否存在
    if (!fs.existsSync(pkgPath)) {
      console.log('  ⚠️ qrcode-fast 包不存在，跳过测试');
      return null;
    }
    
    // 运行 cargo bench
    const output = execSync('cargo bench 2>&1', {
      cwd: pkgPath,
      encoding: 'utf-8',
      timeout: 300000, // 5 分钟超时
    });
    
    // 解析输出
    const rawResults = parseRustBenchmarkOutput(output, ['fast']);
    
    // 映射到标准化测试名称
    const nameMapping: Record<string, { name: string; category: BenchmarkResult['category'] }> = {
      'fast_single_generation': { name: '单条生成 (medium)', category: 'single' },
      'fast_batch_100': { name: '批量生成 (100 条)', category: 'batch' },
      'fast_svg_generation': { name: 'SVG 输出', category: 'svg' },
      'fast_error_levels/L': { name: '纠错级别 L (低)', category: 'error_level' },
      'fast_error_levels/M': { name: '纠错级别 M (中)', category: 'error_level' },
      'fast_error_levels/Q': { name: '纠错级别 Q (较高)', category: 'error_level' },
      'fast_error_levels/H': { name: '纠错级别 H (高)', category: 'error_level' },
      'fast_text_lengths/short_12chars': { name: '单条生成 (short)', category: 'single' },
      'fast_text_lengths/medium_36chars': { name: '单条生成 (medium)', category: 'single' },
      'fast_text_lengths/long_98chars': { name: '单条生成 (long)', category: 'single' },
    };
    
    const results: BenchmarkResult[] = [];
    for (const r of rawResults) {
      const mapping = nameMapping[r.name];
      if (mapping) {
        results.push({
          name: mapping.name,
          ops: r.ops,
          avgTime: r.avgTime,
          category: mapping.category,
        });
      }
    }
    
    // 获取 Rust 版本
    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch {}
    
    return {
      packageName: PACKAGES.fast.name,
      version: '1.0.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results,
    };
  } catch (error) {
    console.error('  ❌ qrcode-fast 基准测试失败:', error);
    return null;
  }
}

/**
 * 运行 Rust 基准测试 (qrcode-rust)
 * 使用标准化的测试名称以便跨包对比
 */
async function benchmarkRust(): Promise<PackageResult | null> {
  try {
    console.log('🦀 测试 @veaba/qrcode-rust...');
    
    const pkgPath = path.join(__dirname, '../../packages/qrcode-rust');
    
    // 运行 cargo bench
    const output = execSync('cargo bench --bench comparison_bench 2>&1', {
      cwd: pkgPath,
      encoding: 'utf-8',
      timeout: 300000, // 5 分钟超时
    });
    
    // 解析输出 - 提取 veaba 的结果
    const rawResults = parseRustBenchmarkOutput(output, ['veaba']);
    
    // 映射到标准化测试名称
    const nameMapping: Record<string, { name: string; category: BenchmarkResult['category'] }> = {
      'veaba_single_generation': { name: '单条生成 (medium)', category: 'single' },
      'veaba_batch_100': { name: '批量生成 (100 条)', category: 'batch' },
      'veaba_svg_generation': { name: 'SVG 输出', category: 'svg' },
      'veaba_error_levels/L': { name: '纠错级别 L (低)', category: 'error_level' },
      'veaba_error_levels/M': { name: '纠错级别 M (中)', category: 'error_level' },
      'veaba_error_levels/Q': { name: '纠错级别 Q (较高)', category: 'error_level' },
      'veaba_error_levels/H': { name: '纠错级别 H (高)', category: 'error_level' },
      'veaba_text_lengths/short_12chars': { name: '单条生成 (short)', category: 'single' },
      'veaba_text_lengths/medium_36chars': { name: '单条生成 (medium)', category: 'single' },
      'veaba_text_lengths/long_98chars': { name: '单条生成 (long)', category: 'single' },
    };
    
    const results: BenchmarkResult[] = [];
    for (const r of rawResults) {
      const mapping = nameMapping[r.name];
      if (mapping) {
        results.push({
          name: mapping.name,
          ops: r.ops,
          avgTime: r.avgTime,
          category: mapping.category,
        });
      }
    }
    
    // 获取 Rust 版本
    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch {}
    
    return {
      packageName: PACKAGES.rust.name,
      version: '1.0.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results,
    };
  } catch (error) {
    console.error('  ❌ qrcode-rust 基准测试失败:', error);
    return null;
  }
}

/**
 * 运行 kennytm-qrcode 基准测试
 */
async function benchmarkKennytm(): Promise<PackageResult | null> {
  try {
    console.log('📦 测试 kennytm-qrcode...');
    
    const pkgPath = path.join(__dirname, '../../packages/qrcode-rust');
    
    // 运行 cargo bench（kennytm 的测试在 qrcode-rust 的 comparison_bench 中）
    const output = execSync('cargo bench --bench comparison_bench 2>&1', {
      cwd: pkgPath,
      encoding: 'utf-8',
      timeout: 300000, // 5 分钟超时
    });
    
    // 解析输出 - 提取 kennytm 的结果
    const rawResults = parseRustBenchmarkOutput(output, ['kennytm']);
    
    // 映射到标准化测试名称
    const nameMapping: Record<string, { name: string; category: BenchmarkResult['category'] }> = {
      'kennytm_single_generation': { name: '单条生成 (medium)', category: 'single' },
      'kennytm_batch_100': { name: '批量生成 (100 条)', category: 'batch' },
      'kennytm_svg_generation': { name: 'SVG 输出', category: 'svg' },
      'kennytm_error_levels/L': { name: '纠错级别 L (低)', category: 'error_level' },
      'kennytm_error_levels/M': { name: '纠错级别 M (中)', category: 'error_level' },
      'kennytm_error_levels/Q': { name: '纠错级别 Q (较高)', category: 'error_level' },
      'kennytm_error_levels/H': { name: '纠错级别 H (高)', category: 'error_level' },
      'kennytm_text_lengths/short_12chars': { name: '单条生成 (short)', category: 'single' },
      'kennytm_text_lengths/medium_36chars': { name: '单条生成 (medium)', category: 'single' },
      'kennytm_text_lengths/long_98chars': { name: '单条生成 (long)', category: 'single' },
    };
    
    const results: BenchmarkResult[] = [];
    for (const r of rawResults) {
      const mapping = nameMapping[r.name];
      if (mapping) {
        results.push({
          name: mapping.name,
          ops: r.ops,
          avgTime: r.avgTime,
          category: mapping.category,
        });
      }
    }
    
    // 获取 Rust 版本
    let rustVersion = 'unknown';
    try {
      rustVersion = execSync('rustc --version', { encoding: 'utf-8' }).trim();
    } catch {}
    
    return {
      packageName: PACKAGES.kennytm.name,
      version: '0.14.0',
      runtime: 'Rust',
      runtimeVersion: rustVersion,
      results,
    };
  } catch (error) {
    console.error('  ❌ kennytm-qrcode 基准测试失败:', error);
    return null;
  }
}

/**
 * 解析 Rust benchmark 输出 (Criterion 格式)
 * Criterion 输出格式: "veaba_single_generation time:   [63.747 µs 64.392 µs 65.077 µs]"
 */
function parseRustBenchmarkOutput(output: string, prefixes: string[]): Array<{name: string; ops: number; avgTime: number}> {
  const results: Array<{name: string; ops: number; avgTime: number}> = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // 匹配 Criterion 格式: "test_name time:   [low mean high]" 或 "test_name time:   [low mean high]"
    const match = line.match(/^([\w/]+)\s+time:\s+\[[\d.]+\s+([\d.]+)\s+(µs|ms|ns|s)\s/);
    if (match) {
      const [, testName, timeValue, unit] = match;

      // 检查是否匹配任一前缀
      const matchesPrefix = prefixes.some(prefix =>
        testName.toLowerCase().startsWith(prefix.toLowerCase())
      );

      if (!matchesPrefix) {
        continue;
      }

      // 转换时间为微秒
      let avgTime = parseFloat(timeValue);
      switch (unit) {
        case 'ns': avgTime = avgTime / 1000; break;
        case 'µs': break;
        case 'ms': avgTime = avgTime * 1000; break;
        case 's': avgTime = avgTime * 1000000; break;
      }

      // 计算 ops/s
      const ops = Math.round(1000000 / avgTime);

      results.push({
        name: testName,
        ops,
        avgTime,
      });
    }
  }

  return results;
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
          rank: 0, // 稍后计算
        });
      }
    }
    
    if (testResults.length === 0) continue;
    
    // 按 ops 排序（越高越好）
    testResults.sort((a, b) => b.ops - a.ops);
    
    // 设置排名
    testResults.forEach((r, i) => { r.rank = i + 1; });
    
    // 计算速度提升倍数
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
  
  // 按类别和测试名称排序
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
  
  // 环境信息
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
  
  // 参与的包
  console.log('📦 参与测试的包:');
  for (const pkg of suite.packages) {
    const icon = Object.values(PACKAGES).find(p => p.name === pkg.packageName)?.icon || '📦';
    console.log(`   ${icon} ${pkg.packageName} (${pkg.runtime} ${pkg.runtimeVersion})`);
  }
  console.log();
  
  // 对比结果
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
  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // 保存完整结果
  const outputPath = path.join(CONFIG.outputDir, 'backend_benchmark_pk.json');
  fs.writeFileSync(outputPath, JSON.stringify(suite, null, 2));
  console.log(`💾 结果已保存到: ${outputPath}`);
  
  // 保存简化版结果（用于前端展示）
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
  console.log('║           🚀 后端 QRCode 包 PK 基准测试套件                                  ║');
  console.log('║           Backend QRCode Package PK Benchmark Suite                          ║');
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
  
  // 运行各包基准测试
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
  
  // 生成对比结果
  console.log('\n─'.repeat(80));
  console.log('生成对比结果...\n');
  suite.comparison = generateComparison(suite.packages);
  
  // 打印结果
  printResults(suite);
  
  // 保存结果
  console.log('─'.repeat(80));
  saveResults(suite);
  
  console.log('\n✅ 基准测试完成！\n');
}

// 运行基准测试
runPKBenchmark().catch(console.error);
