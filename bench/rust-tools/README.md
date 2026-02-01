# rust-tools

qrcode-fast 的验证和性能测试工具集合。

## 📦 说明

此 crate 已从 `packages/qrcode-fast` 中迁移出来，以保持主包的简洁性。

- **qrcode-fast**: 核心高性能二维码生成库
- **rust-tools**: 验证、对比和测试工具（此目录）

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

| 工具 | 功能 | 示例 |
|------|------|------|
| `svg-gen` | 基础 SVG 生成 | `cargo run --bin svg-gen -- "text"` |
| `compare-svgs` | 性能对比 | `cargo run --bin compare-svgs -- "text"` |
| `validate-qr` | 生成并验证 | `cargo run --features validation --bin validate-qr -- "text"` |
| `verify-kennytm` | 验证 kennytm | `cargo run --features validation --bin verify-kennytm -- "text"` |
| `simple-qr` | 默认渲染 | `cargo run --features validation --bin simple-qr -- "text"` |
| `fast-qr` | 优化渲染 | `cargo run --features validation --bin fast-qr -- "text"` |
| `benchmark-report` | 显示报告 | `cargo run --bin benchmark-report` |

## 📊 基准测试

```bash
cargo bench --bench svg_benchmark
```

## 🔧 特性

- `validation` (默认启用): 启用二维码验证功能（需要 resvg, rqrr, image）

## 📈 性能数据

参见 `BENCHMARK_REPORT.md` 或运行 `benchmark-report` 工具。

## 📝 迁移历史

- **2026-01-31**: 从 `packages/qrcode-fast` 迁移至此
