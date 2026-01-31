# wasm-qrcode

> 🚀 高性能 QRCode 生成器 - Rust WASM + JavaScript 双引擎

[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](https://www.rust-lang.org/)
[![WASM](https://img.shields.io/badge/WebAssembly-✓-654ff0.svg)](https://webassembly.org/)
[![Vue](https://img.shields.io/badge/Vue-3.0%2B-4fc08d.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 特性

- **🦀 Rust WASM 核心** - 内存安全，高性能
- **⚡ 实例复用** - 批量生成性能提升 5-10 倍
- **🎨 10+ 个性样式** - 微信、抖音、支付宝、赛博朋克等
- **📦 批量生成** - 一次性生成数千个二维码
- **🖼️ 多种输出** - SVG、Canvas、像素数据
- **🔧 双引擎支持** - WASM + JavaScript 降级方案
- **📊 完整基准测试** - 前端/后端性能对比

![](/public//snapshot.png)

## 🚀 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 构建 WASM
wasm-pack build wasm-qrcode --target web --out-dir pkg
```

### 构建

```bash
# 生产构建
npm run build

# 预览
npm run preview
```

## 📖 使用示例

### 基础用法

```javascript
import init, { QRCodeGenerator } from './wasm-qrcode/pkg/wasm_qrcode.js'

await init()

// 创建生成器实例
const gen = new QRCodeGenerator()

// 生成单个二维码
const svg = gen.generate('https://github.com/veaba/wasm-qrcode')

// 获取 SVG 字符串
document.getElementById('qrcode').innerHTML = gen.get_svg()
```

### 批量生成

```javascript
const texts = [
  'https://github.com/veaba/wasm-qrcode/page1',
  'https://github.com/veaba/wasm-qrcode/page2',
  // ... 数千个
]

// 批量生成，性能最优
const svgs = gen.generate_batch(texts)
```

### 样式化二维码

```javascript
import { 
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode,
  generate_cyberpunk_style_qrcode 
} from './wasm-qrcode/pkg/wasm_qrcode.js'

// 微信风格
const wechatQR = generate_wechat_style_qrcode('https://weixin.qq.com', 256)

// 抖音风格
const douyinQR = generate_douyin_style_qrcode('https://douyin.com', 256)

// 赛博朋克风格
const cyberQR = generate_cyberpunk_style_qrcode('https://github.com/veaba/wasm-qrcode', 256)
```

## 🎨 支持的样式

| 样式 | 函数名 | 特点 |
|------|--------|------|
| 圆角 | `generate_rounded_qrcode` | 柔和圆角设计 |
| Logo区域 | `generate_qrcode_with_logo_area` | 中间留白可放Logo |
| 渐变 | `generate_gradient_qrcode` | 双色渐变效果 |
| 微信 | `generate_wechat_style_qrcode` | 绿色主题 #07C160 |
| 抖音 | `generate_douyin_style_qrcode` | 黑底青红渐变 |
| 支付宝 | `generate_alipay_style_qrcode` | 蓝色主题 + Logo区 |
| 小红书 | `generate_xiaohongshu_style_qrcode` | 红色主题 |
| 赛博朋克 | `generate_cyberpunk_style_qrcode` | 霓虹紫青渐变 |
| 复古 | `generate_retro_style_qrcode` | Sepia 棕色调 |
| 极简 | `generate_minimal_style_qrcode` | 细边框大圆角 |

## 📊 性能基准测试

### 运行基准测试

```bash
# 运行所有后端基准测试
pnpm run benchmark

# 启动开发服务器查看结果
pnpm run dev
# 访问 http://localhost:5173/benchmark
```

### 前端性能对比 (浏览器)

| 包名 | 实现 | 吞吐量 (ops/s) | 单次耗时 (ms) | 性能评级 |
|------|------|---------------|--------------|----------|
| @veaba/qrcode-wasm | Rust WASM | ~50,000 | ~0.02 | ⭐⭐⭐⭐⭐ |
| @veaba/qrcodejs (perf) | 优化 JS | ~35,000 | ~0.029 | ⭐⭐⭐⭐ |
| @veaba/qrcodejs (cache) | 缓存 JS | ~150,000* | ~0.007 | ⭐⭐⭐⭐⭐ |
| @veaba/qrcodejs (original) | 原始 JS | ~25,000 | ~0.04 | ⭐⭐⭐ |

> *缓存版本在重复文本场景下的性能

### 后端性能对比 (Node.js / Bun / Rust)

| 平台 | 单条生成 (ops/s) | 批量生成 1000条 (ops/s) | 平均耗时 (ms) |
|------|-----------------|------------------------|--------------|
| 🦀 Rust Native | ~185,000 | ~520,000 | ~0.0054 |
| 🥟 Bun | ~52,000 | ~145,000 | ~0.0192 |
| 🟢 Node.js | ~45,000 | ~120,000 | ~0.0221 |

### 性能比率

| 对比 | 比率 |
|------|------|
| Rust vs Node.js | **4.1x** 更快 |
| Rust vs Bun | **3.6x** 更快 |
| Bun vs Node.js | **1.15x** 更快 |
| WASM vs JS (浏览器) | **2.0x** 更快 |

### 测试环境

- **CPU**: Intel i7-1165G7
- **内存**: 16GB DDR4
- **浏览器**: Chrome 120+
- **Node.js**: v20.10.0
- **Bun**: 1.0.25
- **Rust**: 1.75.0

## 🏗️ 项目结构

```
wasm-qrcode/
├── packages/
│   ├── qrcode-wasm/        # Rust WASM 核心
│   ├── qrcode-node/        # Node.js 实现
│   ├── qrcode-ts/          # Bun 实现
│   ├── qrcode-rust/        # Rust Native
│   ├── qrcodejs/           # JavaScript 实现
│   └── shared/             # 共享类型和工具
├── src/                    # Vue 前端
│   ├── App.vue
│   └── Benchmark.vue       # 基准测试页面
├── scripts/                # 构建脚本
│   └── benchmark.js        # 基准测试入口
├── public/                 # 静态资源
└── package.json
```

## 📦 包说明

| 包名 | 描述 | 适用场景 |
|------|------|----------|
| `@veaba/qrcode-wasm` | Rust WASM 实现 | 浏览器，最高性能 |
| `@veaba/qrcode-node` | Node.js 实现 | Node.js 服务端 |
| `@veaba/qrcode-ts` | Bun 实现 | Bun 运行时 |
| `@veaba/qrcode-rust` | Rust Native | 原生高性能需求 |
| `@veaba/qrcodejs` | 纯 JavaScript | 兼容性优先 |
| `@veaba/qrcode-shared` | 共享类型 | 所有包依赖 |

## 🔧 API 文档

### QRCodeGenerator

```rust
// 创建实例
pub fn new() -> QRCodeGenerator

// 生成二维码
pub fn generate(&mut self, text: &str)

// 批量生成
pub fn generate_batch(&mut self, texts: Vec<String>) -> Vec<String>

// 获取 SVG
pub fn get_svg(&self) -> String

// 获取模块数据
pub fn get_modules_json(&self) -> String
```

### StyledQRCode

```rust
// 创建样式
let mut style = QRCodeStyle::new()
style.set_size(256)
style.set_colors("#000000", "#ffffff")
style.set_border_radius(8)
style.set_gradient(true, "#667eea", "#764ba2")

// 生成
let mut qr = StyledQRCode::with_style(style)
qr.generate("https://github.com/veaba/wasm-qrcode", 2)
let svg = qr.get_styled_svg()
```

## 🛠️ 技术栈

- **Rust** - 高性能核心算法
- **WebAssembly** - 浏览器原生性能
- **Vue 3** - 响应式前端框架
- **Vite** - 快速构建工具
- **wasm-pack** - WASM 构建工具
- **pnpm** - 包管理器

## 📝 更新日志

### v0.3.0 (2024-01-31)

- ✨ 新增完整基准测试套件
- ✨ 新增 Node.js / Bun / Rust 后端包
- ✨ 新增统一 API 规范
- ✨ 新增性能对比可视化
- 📦 重构为 Monorepo 结构
- ⚡ 性能优化

### v0.2.0 (2024-01-31)

- ✨ 新增实例复用 API (`QRCodeGenerator`)
- ✨ 新增批量生成功能
- ✨ 新增 10 种个性样式
- ✨ 新增 Canvas 渲染器
- 🐛 修复 finder pattern 被覆盖问题
- 🐛 修复 SVG 居中问题
- 🐛 修复 JS 版本栈溢出问题
- ⚡ 性能提升 10 倍

### v0.1.0 (2024-01)

- 🎉 初始版本发布
- ✨ 基础 QRCode 生成
- ✨ WASM + JS 双引擎

## 📄 许可证

[MIT](LICENSE) © 2024 veaba

## 🤝 贡献

欢迎 Issue 和 PR！

---

> 用 ❤️ 和 🦀 Rust 构建
