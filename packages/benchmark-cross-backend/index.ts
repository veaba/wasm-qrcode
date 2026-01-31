/**
 * 跨后端基准测试
 * 对比 Node.js / Bun / Rust 的性能
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CrossBackendResult {
  timestamp: string;
  node?: BackendResult;
  bun?: BackendResult;
  rust?: BackendResult;
  comparison: ComparisonResult[];
}

interface BackendResult {
  version: string;
  singleOps: number;
  batchOps: number;
  avgTime: number;
  memoryUsage?: number;
}

interface ComparisonResult {
  metric: string;
  node?: number;
  bun?: number;
  rust?: number;
  winner: string;
}

/**
 * 运行 Node.js 基准测试
 */
function runNodeBenchmark(): BackendResult | null {
  try {
    console.log('🟢 运行 Node.js 基准测试...');
    
    const output = execSync('cd ../qrcode-node && npx ts-node benchmark/index.ts', {
      encoding: 'utf-8',
      timeout: 60000,
    });
    
    console.log(output);
    
    // 读取结果文件
    const resultPath = path.join(__dirname, '../qrcode-node/benchmark/benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      const data = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
      
      // 提取关键指标
      const singleResult = data.results.find((r: any) => r.name.includes('单条生成 (medium)'));
      const batchResult = data.results.find((r: any) => r.name.includes('批量生成 (1000'));
      
      return {
        version: data.nodeVersion || process.version,
        singleOps: singleResult?.ops || 0,
        batchOps: batchResult?.ops || 0,
        avgTime: singleResult?.avgTime || 0,
      };
    }
  } catch (error) {
    console.error('Node.js 基准测试失败:', error);
  }
  return null;
}

/**
 * 运行 Bun 基准测试
 */
function runBunBenchmark(): BackendResult | null {
  try {
    console.log('🥟 运行 Bun 基准测试...');
    
    const output = execSync('cd ../qrcode-ts && bun run benchmark/index.ts', {
      encoding: 'utf-8',
      timeout: 60000,
    });
    
    console.log(output);
    
    // 读取结果文件
    const resultPath = path.join(__dirname, '../qrcode-ts/benchmark_result.json');
    if (fs.existsSync(resultPath)) {
      const data = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
      
      // 提取关键指标
      const singleResult = data.results.find((r: any) => r.name.includes('单条生成 (medium)'));
      const batchResult = data.results.find((r: any) => r.name.includes('批量生成 (1000'));
      
      return {
        version: data.bunVersion || 'unknown',
        singleOps: singleResult?.ops || 0,
        batchOps: batchResult?.ops || 0,
        avgTime: singleResult?.avgTime || 0,
      };
    }
  } catch (error) {
    console.error('Bun 基准测试失败:', error);
  }
  return null;
}

/**
 * 运行 Rust 基准测试
 */
function runRustBenchmark(): BackendResult | null {
  try {
    console.log('🦀 运行 Rust 基准测试...');
    
    // 使用 cargo bench 运行 Rust 基准测试
    const output = execSync('cd ../qrcode-rust && cargo bench', {
      encoding: 'utf-8',
      timeout: 120000,
    });
    
    console.log(output);
    
    // 解析 cargo bench 输出
    // 注意：这里需要根据实际输出格式调整
    const lines = output.split('\n');
    let singleOps = 0;
    let batchOps = 0;
    
    for (const line of lines) {
      if (line.includes('single_generation')) {
        const match = line.match(/([\d,]+)\s+ops\/s/);
        if (match) {
          singleOps = parseInt(match[1].replace(/,/g, ''));
        }
      }
      if (line.includes('batch_generation')) {
        const match = line.match(/([\d,]+)\s+ops\/s/);
        if (match) {
          batchOps = parseInt(match[1].replace(/,/g, ''));
        }
      }
    }
    
    return {
      version: 'native',
      singleOps,
      batchOps,
      avgTime: singleOps > 0 ? 1000 / singleOps : 0,
    };
  } catch (error) {
    console.error('Rust 基准测试失败:', error);
  }
  return null;
}

/**
 * 生成对比结果
 */
function generateComparison(
  node: BackendResult | null,
  bun: BackendResult | null,
  rust: BackendResult | null
): ComparisonResult[] {
  const comparisons: ComparisonResult[] = [];
  
  // 单条生成对比
  const singleMetrics = [
    { name: 'Node.js', ops: node?.singleOps },
    { name: 'Bun', ops: bun?.singleOps },
    { name: 'Rust', ops: rust?.singleOps },
  ].filter(m => m.ops !== undefined);
  
  if (singleMetrics.length > 0) {
    const winner = singleMetrics.reduce((a, b) => (a.ops! > b.ops! ? a : b));
    comparisons.push({
      metric: '单条生成 (ops/s)',
      node: node?.singleOps,
      bun: bun?.singleOps,
      rust: rust?.singleOps,
      winner: winner.name,
    });
  }
  
  // 批量生成对比
  const batchMetrics = [
    { name: 'Node.js', ops: node?.batchOps },
    { name: 'Bun', ops: bun?.batchOps },
    { name: 'Rust', ops: rust?.batchOps },
  ].filter(m => m.ops !== undefined);
  
  if (batchMetrics.length > 0) {
    const winner = batchMetrics.reduce((a, b) => (a.ops! > b.ops! ? a : b));
    comparisons.push({
      metric: '批量生成 (ops/s)',
      node: node?.batchOps,
      bun: bun?.batchOps,
      rust: rust?.batchOps,
      winner: winner.name,
    });
  }
  
  // 平均耗时对比 (越小越好)
  const timeMetrics = [
    { name: 'Node.js', time: node?.avgTime },
    { name: 'Bun', time: bun?.avgTime },
    { name: 'Rust', time: rust?.avgTime },
  ].filter(m => m.time !== undefined && m.time > 0);
  
  if (timeMetrics.length > 0) {
    const winner = timeMetrics.reduce((a, b) => (a.time! < b.time! ? a : b));
    comparisons.push({
      metric: '平均耗时 (ms)',
      node: node?.avgTime,
      bun: bun?.avgTime,
      rust: rust?.avgTime,
      winner: winner.name,
    });
  }
  
  return comparisons;
}

/**
 * 打印对比结果
 */
function printComparison(result: CrossBackendResult): void {
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 跨后端基准测试对比结果');
  console.log(`⏰ ${result.timestamp}`);
  console.log(`${'='.repeat(70)}\n`);
  
  // 打印各后端结果
  if (result.node) {
    console.log('🟢 Node.js');
    console.log(`   版本: ${result.node.version}`);
    console.log(`   单条生成: ${result.node.singleOps.toLocaleString()} ops/s`);
    console.log(`   批量生成: ${result.node.batchOps.toLocaleString()} ops/s`);
    console.log(`   平均耗时: ${result.node.avgTime.toFixed(4)} ms`);
    console.log();
  }
  
  if (result.bun) {
    console.log('🥟 Bun');
    console.log(`   版本: ${result.bun.version}`);
    console.log(`   单条生成: ${result.bun.singleOps.toLocaleString()} ops/s`);
    console.log(`   批量生成: ${result.bun.batchOps.toLocaleString()} ops/s`);
    console.log(`   平均耗时: ${result.bun.avgTime.toFixed(4)} ms`);
    console.log();
  }
  
  if (result.rust) {
    console.log('🦀 Rust');
    console.log(`   版本: ${result.rust.version}`);
    console.log(`   单条生成: ${result.rust.singleOps.toLocaleString()} ops/s`);
    console.log(`   批量生成: ${result.rust.batchOps.toLocaleString()} ops/s`);
    console.log(`   平均耗时: ${result.rust.avgTime.toFixed(4)} ms`);
    console.log();
  }
  
  // 打印对比
  console.log(`${'─'.repeat(70)}`);
  console.log('🏆 对比结果\n');
  
  for (const comp of result.comparison) {
    console.log(`${comp.metric}:`);
    if (comp.node !== undefined) {
      const marker = comp.winner === 'Node.js' ? '🏆 ' : '   ';
      console.log(`${marker}  Node.js: ${typeof comp.node === 'number' ? comp.node.toLocaleString() : comp.node}`);
    }
    if (comp.bun !== undefined) {
      const marker = comp.winner === 'Bun' ? '🏆 ' : '   ';
      console.log(`${marker}  Bun:     ${typeof comp.bun === 'number' ? comp.bun.toLocaleString() : comp.bun}`);
    }
    if (comp.rust !== undefined) {
      const marker = comp.winner === 'Rust' ? '🏆 ' : '   ';
      console.log(`${marker}  Rust:    ${typeof comp.rust === 'number' ? comp.rust.toLocaleString() : comp.rust}`);
    }
    console.log(`   胜出: ${comp.winner}\n`);
  }
  
  console.log(`${'='.repeat(70)}\n`);
}

/**
 * 运行完整跨后端基准测试
 */
export async function runCrossBackendBenchmark(): Promise<CrossBackendResult> {
  console.log('🚀 开始跨后端基准测试...\n');
  
  const result: CrossBackendResult = {
    timestamp: new Date().toISOString(),
    comparison: [],
  };
  
  // 运行各后端测试
  result.node = runNodeBenchmark() || undefined;
  result.bun = runBunBenchmark() || undefined;
  result.rust = runRustBenchmark() || undefined;
  
  // 生成对比
  result.comparison = generateComparison(result.node || null, result.bun || null, result.rust || null);
  
  // 打印结果
  printComparison(result);
  
  // 保存结果
  const outputPath = path.join(__dirname, 'cross_backend_result.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`💾 结果已保存到: ${outputPath}`);
  
  return result;
}

// 直接运行
if (require.main === module) {
  runCrossBackendBenchmark();
}
