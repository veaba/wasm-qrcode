# compare_rust - Rust QRCode 库对比测试

此目录包含用于对比不同 Rust QRCode 库生成 SVG 性能的基准测试。

## 📁 目录结构

```
bench/
├── compare_rust/          # 本目录 - 基础对比测试
├── qrcode-fast-tools/     # qrcode-fast 的验证和比较工具
├── kennytm-qrcode/        # kennytm/qrcode 的 git submodule
└── benchmark-cross-backend/ # 跨后端性能测试
```

## 🚀 快速开始

### 运行基础对比测试

```bash
cd bench/compare_rust
cargo bench
```

### 运行 qrcode-fast 工具

```bash
cd bench/qrcode-fast-tools

# 生成并验证二维码
cargo run --release --features validation --bin fast-qr -- "Hello World"

# 对比性能
cargo run --release --bin compare-svgs -- "Hello World"

# 验证 kennytm 二维码
cargo run --release --features validation --bin verify-kennytm -- "Hello World"
```

## 📊 测试的库

| 库 | 路径 | 说明 |
|----|------|------|
| qrcode-rust | `../../packages/qrcode-rust` | 我们的完整实现 |
| qrcode (kennytm) | crates.io | 社区最流行的实现 |
| qrcode-fast | `../../packages/qrcode-fast` | 我们的高性能版本 |

## 🛠️ 可用工具 (qrcode-fast-tools)

| 工具 | 说明 |
|------|------|
| `svg-gen` | 基础 SVG 生成 |
| `compare-svgs` | 性能对比测试 |
| `validate-qr` | 生成并验证二维码 |
| `verify-kennytm` | 验证 kennytm 二维码 |
| `simple-qr` | 使用默认渲染生成 |
| `fast-qr` | 使用优化渲染生成 |
| `benchmark-report` | 显示基准测试报告 |

## 📈 性能数据

参见 `qrcode-fast-tools` 生成的报告或运行：

```bash
cd bench/qrcode-fast-tools
cargo run --bin benchmark-report
```

## 📝 历史记录

- **2026-01-31**: 将 qrcode-fast 的验证和比较工具迁移到 `bench/qrcode-fast-tools`
- **2026-01-31**: 简化 qrcode-fast 主包，保持核心功能
