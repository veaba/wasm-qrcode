/**
 * @veaba/qrcode-ts Benchmark
 * Run with: bun run benchmark.ts
 */

import { QRCode, generateBatchQRCodes } from './src/index.js';

const WARMUP_ITERATIONS = 10;
const BENCHMARK_ITERATIONS = 1000;

function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

// 预热
function warmup() {
  console.log('🔥 Warming up...');
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    const qr = new QRCode('https://github.com/veaba/wasm-qrcode');
    qr.toSVG();
  }
}

// 测试单个生成
function benchmarkSingle() {
  const text = 'https://github.com/veaba/wasm-qrcode';
  const totalTime = measureTime(() => {
    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
      const qr = new QRCode(text);
      qr.toSVG();
    }
  });

  const avgTime = totalTime / BENCHMARK_ITERATIONS;
  const opsPerSec = (BENCHMARK_ITERATIONS / totalTime) * 1000;

  console.log('\n📊 Single QRCode Generation:');
  console.log(`  Total time: ${totalTime.toFixed(2)} ms`);
  console.log(`  Average: ${avgTime.toFixed(4)} ms per QRCode`);
  console.log(`  Throughput: ${Math.round(opsPerSec)} ops/s`);

  return { totalTime, avgTime, opsPerSec };
}

// 测试批量生成
function benchmarkBatch() {
  const texts = Array.from({ length: BENCHMARK_ITERATIONS }, (_, i) =>
    `https://github.com/veaba/wasm-qrcode/${i}`
  );

  const totalTime = measureTime(() => {
    generateBatchQRCodes(texts);
  });

  const avgTime = totalTime / BENCHMARK_ITERATIONS;
  const opsPerSec = (BENCHMARK_ITERATIONS / totalTime) * 1000;

  console.log('\n📦 Batch QRCode Generation:');
  console.log(`  Total time: ${totalTime.toFixed(2)} ms`);
  console.log(`  Average: ${avgTime.toFixed(4)} ms per QRCode`);
  console.log(`  Throughput: ${Math.round(opsPerSec)} ops/s`);

  return { totalTime, avgTime, opsPerSec };
}

// 测试不同长度的文本
function benchmarkVariousLengths() {
  console.log('\n📏 Various Text Lengths:');

  const testCases = [
    { name: 'Short (20 chars)', text: 'https://github.com/' },
    { name: 'Medium (50 chars)', text: 'https://github.com/veaba/wasm-qrcode/issues/123' },
    { name: 'Long (100 chars)', text: 'https://github.com/veaba/wasm-qrcode/issues/123/comments/456'.padEnd(100, 'a') },
    { name: 'Very Long (200 chars)', text: 'https://github.com/veaba/wasm-qrcode'.padEnd(200, 'x') }
  ];

  for (const tc of testCases) {
    const iterations = 100;
    const totalTime = measureTime(() => {
      for (let i = 0; i < iterations; i++) {
        const qr = new QRCode(tc.text);
        qr.toSVG();
      }
    });
    const avgTime = totalTime / iterations;
    const opsPerSec = (iterations / totalTime) * 1000;
    console.log(`  ${tc.name}: ${avgTime.toFixed(4)} ms (${Math.round(opsPerSec)} ops/s)`);
  }
}

// 测试样式化生成
function benchmarkStyled() {
  console.log('\n🎨 Styled QRCode Generation:');

  const text = 'https://github.com/veaba/wasm-qrcode';
  const iterations = 100;

  // Rounded
  const roundedTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      const qr = new QRCode(text);
      qr.toStyledSVG({ borderRadius: 8, quietZone: 2 });
    }
  });
  console.log(`  Rounded: ${(roundedTime / iterations).toFixed(4)} ms`);

  // Gradient
  const gradientTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      const qr = new QRCode(text);
      qr.toStyledSVG({ gradient: { color1: '#667eea', color2: '#764ba2' }, quietZone: 2 });
    }
  });
  console.log(`  Gradient: ${(gradientTime / iterations).toFixed(4)} ms`);

  // Wechat Style
  const wechatTime = measureTime(() => {
    for (let i = 0; i < iterations; i++) {
      const qr = new QRCode(text);
      qr.toStyledSVG({
        colorDark: '#07C160',
        colorLight: '#ffffff',
        borderRadius: 4,
        quietZone: 2
      });
    }
  });
  console.log(`  Wechat Style: ${(wechatTime / iterations).toFixed(4)} ms`);
}

// 主函数
function main() {
  console.log('🚀 @veaba/qrcode-ts Benchmark');
  console.log('='.repeat(50));

  warmup();

  const singleResults = benchmarkSingle();
  const batchResults = benchmarkBatch();
  benchmarkVariousLengths();
  benchmarkStyled();

  // 保存结果
  const results = {
    package: '@veaba/qrcode-ts',
    runtime: 'bun',
    timestamp: new Date().toISOString(),
    single: {
      ops_per_sec: Math.round(singleResults.opsPerSec),
      avg_ms: singleResults.avgTime
    },
    batch: {
      ops_per_sec: Math.round(batchResults.opsPerSec),
      avg_ms: batchResults.avgTime
    }
  };

  // 输出 JSON 结果
  console.log('\n📁 Results saved to benchmark_result.json');
  console.log(JSON.stringify(results, null, 2));

  // 保存到文件
  Bun.write('packages/qrcode-ts/benchmark_result.json', JSON.stringify(results, null, 2));
}

main();
