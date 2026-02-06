# rust-tools

Rust QRCode 验证、对比和测试工具集合。

## 📦 说明

此 crate 是 Rust 生态的基准测试和验证工具集，包含：

- 性能对比（veaba vs kennytm）
- 二维码验证（可扫描性检测）
- 调试工具（矩阵对比、数据分析）

## 🚀 快速开始

### 生成并验证二维码

```bash
cargo run --release --features validation --bin fast-qr -- "Hello World"
```

### 性能对比

```bash
cargo run --release --bin compare-svgs -- "Hello World"
```

### 查看基准测试报告

```bash
cargo run --bin benchmark-report
```

## 🛠️ 可用工具

### 对比测试

| 工具 | 功能 | 示例 |
|------|------|------|
| `compare-svgs` | veaba vs kennytm 性能对比 | `cargo run --bin compare-svgs -- "text"` |
| `compare-impls` | 实现对比 | `cargo run --bin compare-impls` |
| `compare-matrix` | 矩阵对比 | `cargo run --bin compare-matrix` |

### 验证工具

| 工具 | 功能 | 示例 |
|------|------|------|
| `validate-qr` | 生成并验证 | `cargo run --features validation --bin validate-qr -- "text"` |
| `verify-kennytm` | 验证 kennytm | `cargo run --features validation --bin verify-kennytm -- "text"` |
| `validate-external-svg` | 验证外部 SVG | `cargo run --bin validate-external-svg -- file.svg "text"` |

### 生成工具

| 工具 | 功能 | 示例 |
|------|------|------|
| `simple-qr` | 默认渲染 | `cargo run --bin simple-qr -- "text"` |
| `fast-qr` | 优化渲染 | `cargo run --bin fast-qr -- "text"` |
| `veaba-qr` | veaba 实现 | `cargo run --bin veaba-qr -- "text"` |

### 报告与基准测试

| 工具 | 功能 | 示例 |
|------|------|------|
| `benchmark-report` | 显示报告 | `cargo run --bin benchmark-report` |
| `benchmark-full` | 完整基准测试 | `cargo run --bin benchmark-full` |
| `benchmark-kennytm` | kennytm 基准测试 | `cargo run --bin benchmark-kennytm` |

### 调试工具

| 工具 | 功能 |
|------|------|
| `debug-qr` | 调试二维码生成 |
| `debug-compare` | 对比调试 |
| `debug-data` | 数据调试 |
| `debug-finder` | Finder pattern 调试 |
| `debug-map` | 地图调试 |
| `debug-matrix` | 矩阵调试 |

## 📊 基准测试

```bash
cargo bench --bench svg_benchmark
```

## 🔧 特性

- `validation` (默认启用): 启用二维码验证功能（需要 resvg, rqrr, image）

## 📈 性能数据

参见 `BENCHMARK_REPORT.md` 或运行 `benchmark-report` 工具。

## 📁 Bench 目录结构

```shell
bench/
├── backend-benchmark/    # 后端包 PK 测试 (Node.js/Bun/Rust)
├── rust-tools/              # Rust 工具集（本目录）
├── frontend-benchmark/      # 前端性能测试
└── kennytm-qrcode/          # kennytm/qrcode git submodule
```

## 📝 迁移历史

- **2026-02-06**: 合并 `bench/compare_rust` 功能（删除原目录）
- **2026-01-31**: 从 `packages/qrcode-fast` 迁移至此
