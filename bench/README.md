# Bench - 基准测试套件

本目录包含 `@veaba/qrcode` 项目的完整基准测试体系，涵盖前端、后端和 Rust 的性能测试。

## 📁 目录结构

```
bench/
├── README.md                   # 本文件
│
├── backend-benchmark/          # 后端包 PK 基准测试
│   ├── index.ts                # 完整基准测试（实时运行所有包）
│   ├── index-fast.ts           # 快速基准测试（使用缓存结果）
│   ├── package.json            # 项目配置
│   └── README.md               # 详细说明文档
│
├── frontend-benchmark/         # 前端性能测试
│   ├── benchmark.cjs           # CommonJS 基准测试脚本
│   └── frontend_benchmark_result.json
│
├── svg-benchmark/              # SVG 生成性能测试
│   ├── index.js                # SVG 测试主入口
│   ├── rust.js                 # Rust 包 SVG 测试
│   ├── js.js                   # JS 包 SVG 测试
│   └── README.md               # 使用说明
│
├── scripts/                    # 基准测试运行脚本
│   └── run.js                  # 统一基准测试入口
│
└── rust-tools/                 # Rust 工具集
    ├── Cargo.toml
    ├── README.md
    └── src/
        ├── lib.rs
        ├── validation.rs
        └── bin/                # 二进制工具集合
```

## 🚀 快速开始

### 运行所有基准测试

```bash
# 运行所有后端基准测试（Node.js + Bun + Rust）
pnpm run benchmark

# 或单独运行
pnpm run benchmark:node     # 仅 Node.js
pnpm run benchmark:bun      # 仅 Bun
pnpm run benchmark:rust     # 仅 Rust

# 直接运行脚本
node bench/scripts/run.js
node bench/scripts/run.js --node
```

### SVG 生成性能测试

```bash
# 综合测试（包含 Rust 和 JavaScript）
pnpm run bench:svg

# 仅测试 Rust 包
pnpm run bench:svg:rust
pnpm run bench:svg:rust:quick   # 快速模式

# 仅测试 JavaScript 包
pnpm run bench:svg:js
pnpm run bench:svg:js:node      # 仅 Node.js
pnpm run bench:svg:js:bun       # 仅 Bun
```

### 清理测试结果

```bash
pnpm run benchmark:clean
```

## 📊 测试覆盖范围

### 1. 后端包性能对比（backend-benchmark 或 scripts/run.js）

对比以下包的 QRCode 生成性能：

| 包名 | 运行时 | 特点 |
|------|--------|------|
| `@veaba/qrcode-node` | Node.js | 稳定可靠，支持 PNG 输出 |
| `@veaba/qrcode-bun` | Bun | 启动快，边缘计算友好 |
| `@veaba/qrcode-fast` | Rust | 极致性能，比 kennytm 快 15-25 倍 |
| `@veaba/qrcode-rust` | Rust | 功能完整，比 kennytm 快 8-10 倍 |
| `kennytm-qrcode` | Rust | 社区参考实现 |

**测试场景**：

- 单条生成 - 基础性能
- 批量生成 (100条) - 吞吐量测试
- 纠错级别 (L/M/Q/H) - 不同复杂度
- SVG 生成 - 矢量图形性能

**最新测试结果**（2026-02-02）：

- 单条生成：`qrcode-fast` > `qrcode-rust` > `qrcode-bun` > `qrcode-node` > `kennytm-qrcode`
- 批量生成：`qrcode-bun` > `qrcode-node` > `qrcode-fast` > `qrcode-rust` > `kennytm-qrcode`

### 2. 前端性能测试（frontend-benchmark）

测试浏览器环境下的 JavaScript 性能：

- 使用 `@veaba/qrcode-js` 进行基准测试
- 测试不同长度文本的生成性能
- 支持单条生成和批量生成测试

**性能数据示例**：

- 短文本生成：~14,715 ops/sec
- 中等文本：~13,189 ops/sec
- 长文本：~3,821 ops/sec
- Unicode 文本：~10,765 ops/sec

### 3. Rust 工具集（rust-tools）

包含 13 个二进制工具，用于生成、对比和验证 QRCode：

#### 生成工具

- `simple-qr` - 默认渲染
- `fast-qr` - 优化渲染
- `veaba-qr` - veaba 实现
- `real-qr` - 真实场景测试

#### 对比工具

- `compare-svgs` - veaba vs kennytm 性能对比
- `compare-impls` - 实现对比
- `compare-matrix` - 矩阵对比

#### 验证工具

- `validate-qr` - 生成并验证（需要 resvg, rqrr, image）
- `verify-kennytm` - 验证 kennytm
- `validate-external-svg` - 验证外部 SVG

#### 报告工具

- `benchmark-report` - 显示基准测试报告
- `benchmark-full` - 完整基准测试
- `benchmark-kennytm` - kennytm 基准测试

## 🔧 使用方法

### 后端包 PK 测试

```bash
cd bench/backend-benchmark

# 完整测试（实时运行所有包）
npm run bench

# 快速测试（使用缓存结果）
npm run bench:fast

# 使用 Bun 运行
npm run bench:bun
```

**输出文件**：

- `backend_benchmark_pk.json` - 完整测试结果
- `backend_benchmark_pk_summary.json` - 摘要结果

### Rust 工具使用

```bash
cd bench/rust-tools

# 构建所有工具
cargo build --release

# 运行基准测试
cargo run --release benchmark-full

# 生成并验证 QRCode
cargo run --release validate-qr

# 对比不同实现
cargo run --release compare-svgs

# 查看完整报告
cargo run --release benchmark-report
```

**工具示例**：

```bash
# 生成简单的 QRCode
cargo run --release simple-qr -- "Hello, World!"

# 生成优化的 QRCode
cargo run --release fast-qr -- "https://example.com"

# 验证生成的 QRCode
cargo run --release validate-qr

# 对比 veaba 和 kennytm 的性能
cargo run --release compare-svgs
```

## 📈 测试结果位置

测试结果保存在以下位置：

```
docs/public/                          # 网站可访问的结果
├── benchmark_node_result.json        # Node.js 测试结果
├── benchmark_bun_result.json         # Bun 测试结果
├── benchmark_rust_result.json        # Rust 测试结果
└── benchmark_summary.json            # 综合摘要

docs/bench/benchmark-output/          # SVG 测试输出
├── *.svg                             # 生成的 QRCode SVG
└── *.json                            # 详细测试报告

bench/                                # 本地测试结果
├── backend-benchmark/
│   └── backend_benchmark_pk*.json
└── frontend-benchmark/
    └── frontend_benchmark_result.json
```

## 🔍 验证功能

Rust 工具集支持 QRCode 验证，确保生成的二维码可以被正确扫描：

**验证流程**：

1. 使用 `qrcode` 库生成 SVG
2. 使用 `resvg` 将 SVG 渲染为位图
3. 使用 `rqrr` 解码二维码
4. 验证解码内容是否匹配原始输入

**启用验证**：

```bash
cargo run --release validate-qr
```

## 📚 相关文档

- [`/skills/BENCHMARK.md`](../skills/BENCHMARK.md) - 详细的基准测试开发指南
- [`backend-benchmark/README.md`](./backend-benchmark/README.md) - 后端 PK 测试详细说明
- [`rust-tools/README.md`](./rust-tools/README.md) - Rust 工具详细说明
- [`/docs/bench/index.mdx`](../docs/bench/index.mdx) - 交互式性能仪表板

## 🆚 性能对比总结

### 单条生成性能

| 包名 | 性能（ops/s） | 相对 kennytm |
|------|--------------|--------------|
| `qrcode-fast` | ~54,283 | 15-25x |
| `qrcode-rust` | ~21,635 | 8-10x |
| `qrcode-bun` | ~18,902 | - |
| `qrcode-node` | ~12,078 | - |
| `kennytm-qrcode` | ~2,200 | 1x |

### SVG 生成性能

| 包名 | 性能（ops/s） | 相对 kennytm |
|------|--------------|--------------|
| `qrcode-fast` | ~40,000 | 20-22x |
| `qrcode-rust` | ~25,000 | 12-15x |
| `qrcode-bun` | ~15,000 | - |
| `qrcode-node` | ~8,000 | - |
| `kennytm-qrcode` | ~1,800 | 1x |

## 🛠️ 故障排除

### Rust 工具构建失败

确保已安装 Rust 工具链：

```bash
rustc --version
cargo --version
```

### 验证功能不可用

验证功能需要额外的依赖：

```bash
# 安装 resvg（SVG 渲染）
# macOS
brew install resvg

# Ubuntu
sudo apt install resvg

# rqrr 和 image 会在 cargo build 时自动编译
```

### Node.js 版本不兼容

确保使用 Node.js v20.19+：

```bash
node --version
```

### Bun 未安装

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

## 🤝 贡献

如果您想添加新的基准测试或改进现有测试，请参考：

1. [`/skills/BENCHMARK.md`](../skills/BENCHMARK.md) - 基准测试开发指南
2. [`/skills/qrcodes-dev/SKILL.md`](../skills/qrcodes-dev/SKILL.md) - 开发指南
3. 现有测试代码作为参考

## 📄 许可证

MIT License - 详见项目根目录的 LICENSE 文件
