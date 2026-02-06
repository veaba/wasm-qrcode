# SVG 性能基准测试

本目录包含 QRCode SVG 生成性能的基准测试脚本。

## 测试内容

对比以下包的 SVG 生成性能：

### Rust 包

- `kennytm-qrcode` - 社区参考实现
- `@veaba/qrcode-rust` - Rust 实现
- `@veaba/qrcode-fast` - 优化的 Rust 实现

### JavaScript 包

- `@veaba/qrcode-node` - Node.js 实现
- `@veaba/qrcode-bun` - Bun 实现

## 快速开始

```bash
# 运行所有 SVG 测试
pnpm bench:svg

# 仅运行 Rust 测试
pnpm bench:svg:rust
pnpm bench:svg:rust:quick    # 快速模式 (10次)

# 仅运行 JS 测试
pnpm bench:svg:js
pnpm bench:svg:js:node       # 仅 Node.js
pnpm bench:svg:js:bun        # 仅 Bun
```

## 直接运行

```bash
# 从项目根目录运行
node bench/svg-benchmark/index.js
node bench/svg-benchmark/rust.js
node bench/svg-benchmark/node-bun.js
```

## 输出文件

- **SVG 文件**: `docs/bench/benchmark-output/*.svg`
- **JSON 报告**: `docs/public/benchmark_svg_rust.json`

## 测试说明

### Rust 测试

- 包含 SVG 生成和验证（使用 resvg + rqrr）
- 验证生成的二维码能否被正确扫描
- 支持快速模式（10次运行）和完整模式（100次运行）

### JavaScript 测试

- 仅测试 SVG 生成性能
- 不包含验证（需要额外的验证工具）
- 测试 Node.js 和 Bun 两个运行时

## 命令行选项

```bash
# Rust 测试
node bench/svg-benchmark/rust.js --quick       # 快速模式
node bench/svg-benchmark/rust.js --skip-build  # 跳过构建

# JS 测试
node bench/svg-benchmark/node-bun.js --node          # 仅 Node.js
node bench/svg-benchmark/node-bun.js --bun           # 仅 Bun
node bench/svg-benchmark/node-bun.js --all           # 全部运行
```
