# QRCode 基准测试开发指南

## 快速开始

### 运行所有基准测试

```bash
# 一键运行所有测试（前端 + 后端 + PK）
pnpm run benchmark

# 单独运行各维度测试
pnpm run benchmark:frontend    # 前端测试
pnpm run benchmark:backend     # 后端测试
pnpm run benchmark:pk          # PK 多包对比
```

### 直接运行特定测试

```bash
# 前端基准测试（推荐）
cd bench/frontend-benchmark
node benchmark.cjs

# 前端基准测试（TypeScript 版本，需先构建）
cd bench/frontend-benchmark
npx tsx index.ts

# Node.js 后端测试
cd packages/qrcode-node
node benchmark/index.js

# Bun 后端测试
cd packages/qrcode-bun
bun run benchmark/index.ts

# Rust 基准测试
cd packages/qrcode-rust
cargo bench

# PK 基准测试（对比 3 个包：Node.js + Bun + Rust）
cd bench/backend-benchmark-pk
npx tsx index.ts      # 完整测试（包含 Rust，耗时约 5 分钟）
npx tsx index-fast.ts # 快速测试（使用缓存的 Rust 结果）
```

## 添加新的基准测试

### 1. 为现有包添加新的测试项

#### Node.js/Bun 包

编辑 `packages/qrcode-node/benchmark/index.ts` 或 `packages/qrcode-bun/benchmark/index.ts`:

```typescript
// 在 benchmarkNODE 或 benchmarkBUN 函数中添加
const newResult = runBenchmark(
  '新测试项名称',
  () => {
    // 测试代码
    const qr = new QRCodeCore(TEST_TEXTS.medium, QRErrorCorrectLevel.H);
    qr.toSVG();
  },
  CONFIG.benchmarkRuns
);
results.push(newResult);
```

#### Rust 包

编辑 `packages/qrcode-rust/benches/comparison_bench.rs`:

```rust
fn bench_new_test(c: &mut Criterion) {
    let text = "https://github.com/veaba/qrcodes";
    
    c.bench_function("veaba_new_test", |b| {
        b.iter(|| {
            let qr = QRCode::new(text).unwrap();
            black_box(qr.to_svg(256));
        });
    });
}

// 添加到 criterion_group!
criterion_group!(benches, bench_new_test, /* ...其他测试 */);
```

### 2. 添加新的对比包

编辑 `bench/backend-benchmark-pk/index.ts`:

```typescript
// 1. 在 PACKAGES 中添加包信息
const PACKAGES = {
  // ... 现有包
  newpackage: {
    name: '@veaba/qrcode-new',
    description: '新包描述',
    color: '#ff0000',
    icon: '🆕',
  },
};

// 2. 添加基准测试函数
async function benchmarkNewPackage(): Promise<PackageResult | null> {
  try {
    console.log('🆕 测试 @veaba/qrcode-new...');
    
    // 运行测试...
    
    return {
      packageName: PACKAGES.newpackage.name,
      version: '1.0.0',
      runtime: 'Node.js', // 或 'Rust', 'Bun'
      runtimeVersion: process.version,
      results: [...],
    };
  } catch (error) {
    console.error('  ❌ 新包基准测试失败:', error);
    return null;
  }
}

// 3. 在 runPKBenchmark 中调用
const newResult = await benchmarkNewPackage();
if (newResult) suite.packages.push(newResult);
```

### 4. 添加 Rust 包到 PK 测试

如果要将新的 Rust 包添加到 PK 测试，需要：

1. **创建 benchmark 文件**：`packages/qrcode-new/benches/comparison_bench.rs`
2. **配置 Cargo.toml**：添加 `[[bench]]` 配置
3. **使用标准测试名称**：确保测试名称与 Node.js/Bun 包的测试名称一致，例如：
   - `单条生成 (short/medium/long)`
   - `批量生成 (100 条)`
   - `SVG 输出`
   - `纠错级别 L/M/Q/H`
4. **在 index.ts 中添加映射**：

```typescript
const nameMapping: Record<string, { name: string; category: BenchmarkResult['category'] }> = {
  'new_single_generation': { name: '单条生成 (medium)', category: 'single' },
  'new_svg_generation': { name: 'SVG 输出', category: 'svg' },
  // ...
};
```

### 3. 添加新的测试维度

#### 步骤 1: 在各包中添加测试

确保所有包都实现了相同名称的测试项。

#### 步骤 2: 更新分类函数

编辑 `bench/backend-benchmark-pk/index.ts`:

```typescript
function categorizeTest(name: string): BenchmarkResult['category'] {
  const lower = name.toLowerCase();
  if (lower.includes('batch')) return 'batch';
  if (lower.includes('svg')) return 'svg';
  if (lower.includes('error')) return 'error_level';
  if (lower.includes('newdimension')) return 'new_dimension'; // 添加新分类
  return 'single';
}
```

#### 步骤 3: 更新前端组件

编辑 `docs/components/PKBenchmarkDashboard.tsx`:

```typescript
const CATEGORY_NAMES: Record<string, string> = {
  single: '📝 单条生成',
  batch: '📚 批量生成',
  svg: '🎨 SVG 生成',
  error_level: '🔧 纠错级别',
  new_dimension: '🆕 新维度', // 添加新分类名称
};
```

## 基准测试最佳实践

### 1. 预热

始终进行预热，避免冷启动影响结果：

```typescript
// 预热
for (let i = 0; i < CONFIG.warmupRuns; i++) {
  fn();
}

// 正式测试
const start = performance.now();
for (let i = 0; i < runs; i++) {
  fn();
}
```

### 2. 防止编译器优化（Rust）

使用 `black_box` 防止编译器优化掉测试代码：

```rust
use criterion::black_box;

b.iter(|| {
    let qr = QRCode::new(black_box(text)).unwrap();
    black_box(qr.to_svg(256));
});
```

### 3. 内存测量

Node.js/Bun 中可以测量内存使用：

```typescript
const before = process.memoryUsage().heapUsed;
// ... 运行测试
const after = process.memoryUsage().heapUsed;
const memoryDelta = after - before;
```

### 4. 标准化输出

确保所有包输出相同格式的结果，便于对比：

```typescript
interface BenchmarkResult {
  name: string;        // 测试项名称（统一命名）
  ops: number;         // 每秒操作数
  avgTime: number;     // 平均耗时（统一单位：微秒）
  category: string;    // 分类（统一分类名）
}
```

## 调试基准测试

### 查看详细输出

```bash
# Node.js/Bun - 添加调试日志
DEBUG=1 npx tsx index.ts

# Rust - 显示详细输出
cargo bench -- --verbose
```

### 检查 JSON 输出

```bash
# 格式化查看 JSON 结果
cat docs/public/backend_benchmark_pk.json | jq '.'
```

### 验证数据加载

在浏览器控制台检查：

```javascript
fetch('/backend_benchmark_pk.json')
  .then(r => r.json())
  .then(data => console.log(data));
```

## 常见问题

### Q: 基准测试结果不一致？

A: 可能原因：
- 系统负载：确保测试时没有其他高负载程序运行
- 电源管理：笔记本电脑请连接电源并设置为高性能模式
- 温度节流：长时间运行可能导致 CPU 降频

### Q: Rust 测试编译失败？

A: 检查：
```bash
# 确保使用 release 模式
cargo bench  # 自动使用 release

# 检查依赖
cargo check

# 清理并重建
cargo clean && cargo bench
```

### Q: 前端组件不显示数据？

A: 检查：
1. JSON 文件是否存在于 `docs/public/`
2. 文件路径是否正确（以 `/` 开头）
3. JSON 格式是否有效
4. 浏览器控制台是否有错误

### Q: 如何添加图表？

A: 使用 `BenchmarkCharts.tsx` 中的现有组件：

```tsx
import { BarChart, ComparisonTable } from '../components/BenchmarkCharts';

// 柱状图
<BarChart data={data} title="性能对比" />

// 对比表格
<ComparisonTable data={data} />
```

## 基准测试输出

### JSON 数据文件

所有基准测试结果保存在 `docs/public/`：

| 文件 | 说明 | 典型大小 |
|------|------|---------|
| `frontend_benchmark_result.json` | 前端 @veaba/qrcode-js 测试结果 | ~2 KB |
| `benchmark_node_result.json` | Node.js 后端测试结果 | ~2.5 KB |
| `benchmark_bun_result.json` | Bun 后端测试结果 | ~2.8 KB |
| `backend_benchmark_pk.json` | PK 完整对比结果 | ~13 KB |
| `backend_benchmark_pk_summary.json` | PK 摘要结果 | ~7 KB |
| `benchmark_summary.json` | 所有测试汇总 | ~0.1 KB |

### 文档报告

- `docs/bench/index.mdx` - 基准测试总览
- `docs/bench/front-bench.mdx` - 前端基准测试报告
- `docs/bench/backend-bench.mdx` - 后端基准测试报告（Node.js vs Bun）
- `docs/bench/backend-pk.mdx` - PK 多包对比报告
- `docs/bench/compare-rust.mdx` - Rust 包对比报告

### 可视化组件

- `docs/components/BenchmarkCharts.tsx` - 图表组件（柱状图、对比表）
- `docs/components/PKBenchmarkDashboard.tsx` - PK 对比仪表盘

## 参考

- [Criterion.rs 文档](https://bheisler.github.io/criterion.rs/book/)
- [Rspress 文档](https://rspress.dev/)
- 项目中的示例代码：
  - `bench/frontend-benchmark/benchmark.cjs`
  - `bench/backend-benchmark-pk/index.ts`
  - `docs/components/PKBenchmarkDashboard.tsx`
