# @veaba/qrcodes

> 🚀 高性能 QRCode 生成器 - 支持 Rust、WASM、Node.js、Bun 的多运行时解决方案
>
> 🔥 **比主流 Rust QRCode 库快 8-75 倍！**

[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](https://www.rust-lang.org/)
[![WASM](https://img.shields.io/badge/WebAssembly-✓-654ff0.svg)](https://webassembly.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933.svg)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3%2B-000000.svg)](https://bun.sh/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 特性

- **🦀 Rust 原生核心** - 内存安全，极致性能
- **🔥 极致性能** - 比 crates.io 最流行的 QRCode 库快 **8-75 倍**！
- **⚡ 多运行时支持** - 浏览器(WASM)、Node.js、Bun、原生 Rust
- **📦 智能缓存** - 内置 LRU 缓存，重复文本生成性能提升 10-100 倍
- **🎨 丰富样式** - 圆角、渐变、Logo 区域、多种主题风格（微信、抖音、支付宝等）
- **🖼️ 多种输出** - SVG、PNG、Canvas、像素数据
- **📊 完整基准测试** - 前端/后端性能对比，可视化报告
- **🔧 TypeScript** - 完整的类型定义，优秀的开发体验

## 📦 包概览

| 包名 | 环境 | 特点 | 适用场景 |
|------|------|------|----------|
| `@veaba/qrcode-fast` | Rust | 极致性能，比 kennytm 快 **37-75 倍** | 追求极致性能的 Rust 项目 |
| `@veaba/qrcode-rust` | Rust | 功能完整，比 kennytm 快 **8-10 倍** | 标准 Rust 项目 |
| `@veaba/qrcode-wasm` | 浏览器 | Rust 编译为 WASM，性能最佳 | 前端生产环境 |
| `@veaba/qrcode-js` | 浏览器 | 纯 JavaScript，即时启动 | 无需 WASM 的场景 |
| `@veaba/qrcode-node` | Node.js | 服务端渲染，支持 PNG | Node.js 后端 |
| `@veaba/qrcode-bun` | Bun | Bun 运行时优化 | 边缘计算、高并发 |
| `@veaba/qrcode-shared` | 通用 | 共享核心，缓存系统 | 内部依赖 |

## 🚀 快速开始

### 安装

```bash
# 浏览器 (WASM)
pnpm add @veaba/qrcode-wasm

# 浏览器 (纯 JS)
pnpm add @veaba/qrcode-js

# Node.js
pnpm add @veaba/qrcode-node

# Bun
pnpm add @veaba/qrcode-bun
```

### 浏览器 (WASM)

```typescript
import init, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

// 初始化 WASM
await init();

// 创建 QRCode
const qr = new QRCodeCore('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
console.log(svg);
```

### 浏览器 (纯 JS)

```typescript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-js';

const qr = new QRCodeCore('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
```

### Node.js

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
const png = qr.toPNGBuffer(); // 获取 PNG Buffer
```

### Bun

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-bun';

const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
await qr.saveToFile('qrcode.svg'); // Bun 文件操作
```

### Rust

```rust
use qrcode_fast::{QRCode, QRErrorCorrectLevel};

// 极致性能版本
let mut qr = QRCode::with_options(QRErrorCorrectLevel::H);
qr.make_code("https://github.com/veaba/qrcodes");
let svg = qr.get_svg();
```

## 🎨 样式化二维码

```typescript
import { 
  generateRoundedQRCode,
  generateGradientQRCode,
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateAlipayStyleQRCode,
  generateCyberpunkStyleQRCode 
} from '@veaba/qrcode-js'; // 或 @veaba/qrcode-wasm

// 圆角二维码
const rounded = generateRoundedQRCode('Hello', 256, 8);

// 渐变二维码
const gradient = generateGradientQRCode('Hello', 256, '#667eea', '#764ba2');

// 微信风格
const wechat = generateWechatStyleQRCode('https://weixin.qq.com', 256);

// 抖音风格
const douyin = generateDouyinStyleQRCode('https://douyin.com', 256);

// 赛博朋克风格
const cyberpunk = generateCyberpunkStyleQRCode('Hello', 256);
```

### 支持的样式

| 样式 | 函数名 | 特点 |
|------|--------|------|
| 圆角 | `generateRoundedQRCode` | 柔和圆角设计 |
| Logo区域 | `generateQRCodeWithLogoArea` | 中间留白可放Logo |
| 渐变 | `generateGradientQRCode` | 双色渐变效果 |
| 微信 | `generateWechatStyleQRCode` | 绿色主题 #07C160 |
| 抖音 | `generateDouyinStyleQRCode` | 黑底青红渐变 |
| 支付宝 | `generateAlipayStyleQRCode` | 蓝色主题 + Logo区 |
| 小红书 | `generateXiaohongshuStyleQRCode` | 红色主题 |
| 赛博朋克 | `generateCyberpunkStyleQRCode` | 霓虹紫青渐变 |
| 复古 | `generateRetroStyleQRCode` | Sepia 棕色调 |
| 极简 | `generateMinimalStyleQRCode` | 细边框大圆角 |

## 📊 性能基准测试

### 🔥 与主流 Rust QRCode 库对比

与 [kennytm/qrcode](https://github.com/kennytm/qrcode-rust) (crates.io 下载量最高的 QRCode 库) 的性能对比：

#### @veaba/qrcode-fast（极致性能版）

| 测试项 | @veaba/qrcode-fast | kennytm-qrcode | 速度提升 |
|--------|-------------------|----------------|----------|
| **单条生成** | ~18.4 µs | ~688.9 µs | **🔥 37x 更快** |
| **SVG 生成 (Simple)** | ~10.8 µs | ~815.8 µs | **🔥 75x 更快** |
| **SVG 生成 (Complex)** | ~18.4 µs | ~688.9 µs | **🔥 37x 更快** |
| **纠错级别 H** | ~21.1 µs | ~446.2 µs | **🔥 21x 更快** |

#### @veaba/qrcode-rust（功能完整版）

| 测试项 | @veaba/qrcode-rust | kennytm-qrcode | 速度提升 |
|--------|-------------------|----------------|----------|
| **单条生成** | ~51.0 µs | ~438.3 µs | **🔥 8.6x 更快** |
| **批量 100 条** | ~4.01 ms | ~32.13 ms | **🔥 8.0x 更快** |
| **纠错级别 L** | ~29.0 µs | ~306.5 µs | **🔥 10.6x 更快** |
| **纠错级别 H** | ~42.0 µs | ~446.2 µs | **🔥 10.6x 更快** |

### 运行时性能对比

| 运行时 | 单条生成 (ops/s) | SVG 输出 (ops/s) | 特点 |
|--------|-----------------|-----------------|------|
| 🦀 Rust (qrcode-fast) | **54,283** | **92,486** | 极致性能 |
| 🦀 Rust (qrcode-rust) | 21,635 | 28,780 | 功能完整 |
| 🥟 Bun | 18,902 | 18,003 | 启动快，批量优 |
| 🟢 Node.js | 12,078 | 10,150 | 生态丰富 |
| 🌐 WASM (浏览器) | ~15,000 | ~15,000 | 前端最快 |

### 运行基准测试

```bash
# 运行所有基准测试
pnpm run benchmark

# 后端测试
pnpm run benchmark:backend
pnpm run benchmark:node
pnpm run benchmark:bun
pnpm run benchmark:rust

# SVG 生成测试
pnpm run bench:svg:rust:quick
pnpm run bench:svg:quick
```

## 🏗️ 项目结构

```
qrcodes/
├── packages/
│   ├── qrcode-fast/        # 极致性能 Rust 实现
│   ├── qrcode-rust/        # 功能完整 Rust 实现
│   ├── qrcode-wasm/        # Rust WASM 浏览器包
│   ├── qrcode-js/          # 纯 JavaScript 浏览器包
│   ├── qrcode-node/        # Node.js 后端包
│   ├── qrcode-bun/         # Bun 后端包
│   └── qrcode-shared/      # 共享核心逻辑
├── docs/                   # Rspress 文档站点
├── bench/                  # 基准测试工具
│   ├── rust-tools/         # Rust 对比测试工具
│   ├── frontend-benchmark/ # 前端性能测试
│   └── backend-benchmark/ # 后端 PK 测试
├── scripts/                # 构建和发布脚本
└── skills/                 # 开发技能文档
```

## 🔧 开发

### 环境要求

- Windows / Linux / macOS
- Node.js v20.19+
- Bun 1.3.0+
- pnpm 9.15.4+
- Rust 1.70+
- wasm-pack (WASM 构建)

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm run build
```

### 运行测试

本项目使用 **Vitest** 进行测试，支持两种测试模式：

#### 单元测试 (Node.js 环境)

```bash
# 运行所有单元测试（Node.js 环境）
pnpm run test:unit

# 监视模式
pnpm run test:watch

# 覆盖率报告
pnpm run test:coverage
```

#### 浏览器模式测试

用于测试 **WASM 模块**在真实浏览器环境中的功能，需要系统安装 Chrome：

```bash
# 运行浏览器模式测试（真实 Chrome 环境）
pnpm run test:browser

# 调试模式（ headed 模式，显示浏览器窗口）
pnpm run test:browser:ui
```

**浏览器测试配置：**
- 使用 Playwright 驱动真实 Chrome 浏览器
- 自动加载并初始化 WASM 模块
- 测试 WASM QRCode 生成、样式渲染、缓存系统等完整功能
- 配置文件：`vitest.config.browser.ts`
- 测试文件：`tests/**/*.browser.test.ts`

#### Rust 测试

```bash
# qrcode-rust 测试
cd packages/qrcode-rust && cargo test

# qrcode-fast 测试
cd packages/qrcode-fast && cargo test
```

#### 测试结构

```
tests/
├── qrcode-js/           # @veaba/qrcode-js 测试
├── qrcode-node/         # @veaba/qrcode-node 测试
├── qrcode-shared/       # @veaba/qrcode-shared 测试
├── qrcode-bun/          # @veaba/qrcode-bun 测试
├── qrcode-wasm/
│   ├── index.test.ts         # WASM API 单元测试
│   └── index.browser.test.ts # WASM 浏览器模式测试 ⭐
└── qrcode-wasm/pkg.test.ts   # WASM 构建产物测试
```

### 文档开发

```bash
# 启动文档开发服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build

# 预览文档
pnpm run docs:preview
```

## 📖 文档

- [API 参考](./docs/api/index.md) - 完整 API 文档
- [快速开始](./docs/guide/qrcode-wasm.md) - WASM 包使用指南
- [Node.js 指南](./docs/guide/qrcode-node.md) - Node.js 包使用指南
- [Bun 指南](./docs/guide/qrcode-bun.md) - Bun 包使用指南
- [Rust 指南](./docs/guide/qrcode-rust.md) - Rust 包使用指南
- [性能优化指南](./docs/guide/performance.md) - 性能优化建议
- [基准测试指南](./skills/BENCHMARK.md) - 基准测试开发指南

## 🛠️ 技术栈

- **Rust** - 高性能核心算法
- **WebAssembly** - 浏览器原生性能
- **TypeScript** - 类型安全的 JavaScript
- **Rspress** - 文档站点生成器
- **Vitest** - 单元测试框架
- **Playwright** - 浏览器测试
- **pnpm** - 包管理器

## 📄 许可证

[MIT](LICENSE) © 2024-2025 veaba

## 🤝 贡献

欢迎 Issue 和 PR！

- 🐙 GitHub: <https://github.com/veaba/qrcodes/issues>

---

> 用 ❤️ 和 🦀 Rust 构建
