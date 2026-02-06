# Frontend Benchmark

前端 QRCode 包基准测试 - 对比 @veaba/qrcode-js 和 @veaba/qrcode-wasm 的性能。

## 📁 目录结构

```
bench/frontend-benchmark/
├── benchmark.cjs                    # qrcode-js 基准测试 (Node.js)
├── wasm.benchmark.ts                # qrcode-wasm 基准测试 (浏览器/Node)
├── benchmark.rs                     # Rust 原生基准测试（对比用）
├── frontend_benchmark_result.json   # 测试结果输出
└── README.md                        # 本文件
```

## 🚀 快速开始

### 测试 @veaba/qrcode-js (TypeScript 实现)

```bash
cd bench/frontend-benchmark
node benchmark.cjs
```

### 测试 @veaba/qrcode-wasm (WASM 实现)

**需要先构建 WASM：**

```bash
cd packages/qrcode-wasm
wasm-pack build --target web

cd bench/frontend-benchmark
npx tsx wasm.benchmark.ts
```

### 测试 Rust 原生性能（对比基准）

```bash
cd bench/frontend-benchmark
cargo run --bin benchmark
```

## 📊 测试内容

### qrcode-js (benchmark.cjs)

| 测试项 | 说明 |
|--------|------|
| 单条生成 (short/medium/long/unicode) | 不同文本长度的性能 |
| 批量生成 (10/100/1000 条) | 批量处理性能 |
| 纠错级别 (L/M/Q/H) | 不同纠错级别的性能 |

### qrcode-wasm (wasm.benchmark.ts)

| 测试项 | 说明 |
|--------|------|
| 单条生成 | WASM 单次生成性能 |
| 批量生成 | WASM 批量处理性能 |
| 实例复用 | 复用实例 vs 新建实例 |
| 纠错级别 | 不同纠错级别的性能 |

### Rust 原生 (benchmark.rs)

| 测试项 | 说明 |
|--------|------|
| 纯矩阵生成 | 字符串 → QRCode 矩阵 |
| SVG 渲染 | 矩阵 → SVG 字符串 |
| 完整流程 | 字符串 → SVG |
| 实例复用 | 复用生成器实例 |

## 📈 性能对比参考

| 场景 | qrcode-js | qrcode-wasm | 提升 |
|------|-----------|-------------|------|
| 单条生成 | ~9,000 ops/s | ~15,000 ops/s | **1.7x** |
| SVG 输出 | ~9,800 ops/s | ~17,000 ops/s | **1.7x** |
| 缓存命中 | ~500,000 ops/s | ~500,000 ops/s | 相同 |

*测试环境：Chrome 120, Intel i7-1165G7*

## 📝 历史迁移

- **2026-02-06**: `@veaba/qrcode-wasm` 基准测试从 `packages/qrcode-wasm/benchmark/` (TypeScript) 和 `packages/qrcode-wasm/src/bin/benchmark.rs` (Rust) 迁移至此，统一前端包性能测试管理。
