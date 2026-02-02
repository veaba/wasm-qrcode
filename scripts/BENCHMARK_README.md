# QRCode SVG 生成性能基准测试

本目录包含用于对比不同 QRCode 包性能的脚本。

## 测试的包

### Rust 包
- **kennytm-qrcode** - 社区流行的 Rust QRCode 库（参考基准）
- **@veaba/qrcode-rust** - 纯 Rust 实现，参考版本
- **@veaba/qrcode-fast** - 极致性能优化版本

### JavaScript/TypeScript 包
- **@veaba/qrcode-node** - Node.js 版本
- **@veaba/qrcode-bun** - Bun 运行时优化版本

## 快速开始

### 1. Rust 包性能测试（推荐）

最简单的运行方式：

```bash
# Windows
scripts\run-full-benchmark.bat

# 或者手动运行
cd bench/rust-tools
cargo run --release --features validation --bin benchmark-full -- --quick
```

**选项：**
- `--quick` - 快速模式（每测试 10 次运行）
- 无参数 - 完整模式（每测试 100 次运行）

### 2. JavaScript 包性能测试

```bash
# Windows
scripts\run-js-benchmark.bat

# 或者手动运行
node scripts/benchmark-js-packages.js
```

## 详细说明

### 测试内容

1. **生成 SVG** - 测量从文本到 SVG 字符串的生成时间
2. **验证二维码** - 使用 resvg + rqrr 验证生成的二维码可以被正确扫描
3. **对比性能** - 对比不同包的生成速度和正确性

### 测试用例

| 名称 | 文本内容 | 复杂度 |
|------|---------|--------|
| Simple | "Hello World" | 低 (版本 1) |
| Complex | "Test QR Code 123" | 中 (版本 3) |
| URL | "https://github.com/veaba/qrcodes" | 中 (版本 3) |
| Long | "Email: test@example.com \| Phone: +1-234-567-8900..." | 高 (版本 6) |

### 输出文件

运行后会生成：

```
bench/rust-tools/benchmark-output/
├── Simple_kennytm.svg          # kennytm-qrcode 生成的 SVG
├── Simple_qrcode_rust.svg      # @veaba/qrcode-rust 生成的 SVG
├── Simple_qrcode_fast.svg      # @veaba/qrcode-fast 生成的 SVG
├── Complex_kennytm.svg
├── ...
└── benchmark-report.json       # 详细的 JSON 报告
```

## 手动运行各个工具

### 生成并验证单个二维码

```bash
cd bench/rust-tools

# 使用 kennytm-qrcode
cargo run --release --features validation --bin validate-qr -- "Hello World" output.svg

# 对比 @veaba 包
cargo run --release --features validation --bin veaba-qr -- "Hello World"
```

### 对比两个实现

```bash
cargo run --release --bin compare-impls -- modules "Test QR Code 123"
```

### 调试二维码

```bash
# 打印二维码模块信息
cargo run --release --bin debug-qr -- "Hello World"

# 对比两个实现的差异
cargo run --release --bin debug-compare -- "Test QR Code 123"
```

## 预期结果

### 性能对比（基于之前的测试）

| 包 | 相对速度 | 验证状态 |
|---|---------|---------|
| kennytm-qrcode | 1x (基准) | ✅ 通过 |
| @veaba/qrcode-rust | ~10x | ⚠️ 部分通过 |
| @veaba/qrcode-fast | ~23-25x | ⚠️ 部分通过 |

### 已知问题

- `@veaba/qrcode-rust` 和 `@veaba/qrcode-fast` 在某些复杂文本（如 "Test QR Code 123"）上验证失败
- 这表明 Reed-Solomon 纠错码计算可能存在问题
- 简单文本（如 "Hello World"）通常可以通过验证

## 故障排除

### 构建失败

```bash
# 清理并重新构建
cargo clean
cargo build --release --features validation
```

### 验证功能不可用

确保使用 `--features validation` 标志编译：

```bash
cargo run --release --features validation --bin benchmark-full
```

### Node.js/Bun 包找不到

确保先构建 TypeScript 文件：

```bash
cd packages/qrcode-node
npm run build

cd packages/qrcode-bun
bun run build  # 或 npm run build
```

## 技术细节

### 验证原理

1. 使用 `resvg` 将 SVG 渲染为位图
2. 使用 `rqrr` 从位图中解码二维码
3. 对比解码后的文本与原始文本

### 性能测量

- 使用 `std::time::Instant` 进行高精度计时
- 预热 5 次以稳定 CPU 缓存
- 正式运行 100 次（快速模式 10 次）
- 报告平均、最小、最大时间

## 贡献

如果发现性能回归或验证失败，请：

1. 运行基准测试并保存报告
2. 创建 issue 描述问题
3. 附上生成的 SVG 文件（如有需要）
