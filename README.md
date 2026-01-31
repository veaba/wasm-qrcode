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

## 📊 性能对比

| 场景 | 旧版 (创建/销毁) | 新版 (实例复用) | 提升 |
|------|------------------|-----------------|------|
| 单条生成 | 621 μs | 61 μs | **10x** |
| 1000条批量 | 621 ms | 61 ms | **10x** |
| 10000条批量 | 6.2 s | 0.6 s | **10x** |

*测试环境：Chrome 120, Intel i7-1165G7*

## 🏗️ 项目结构

```
wasm-qrcode/
├── wasm-qrcode/          # Rust WASM 核心
│   ├── src/
│   │   ├── lib.rs              # WASM 导出 API
│   │   ├── qr_generator.rs     # 新版生成器（推荐）
│   │   ├── qr_styled.rs        # 样式化二维码
│   │   ├── qr_code_model.rs    # 核心模型
│   │   └── ...
│   └── Cargo.toml
├── qrcodejs/             # JavaScript 参考实现
│   └── src/
│       └── qrcode.js     # 完全重写，无栈溢出
├── src/                  # Vue 前端
│   └── App.vue
├── public/               # 静态资源
└── package.json
```

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

## 📝 更新日志

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
