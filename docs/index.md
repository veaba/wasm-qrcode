---
pageType: home

hero:
  name: Wasm QRCode
  text: 高性能 QRCode 生成库
  tagline: 支持 WASM、Node.js、Bun 和 Rust 的多运行时 QRCode 解决方案
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/veaba/wasm-qrcode
  image:
    src: /logo.png
    alt: Wasm QRCode Logo

features:
  - title: 🚀 高性能
    details: Rust 编译为 WASM，性能比纯 JavaScript 实现快 2-5 倍。
  - title: 🌐 跨平台
    details: 一套代码，支持浏览器、Node.js、Bun 和原生 Rust 环境。
  - title: 📦 模块化
    details: 按需引入，只打包你需要的功能，支持 Tree Shaking。
  - title: 💾 智能缓存
    details: 内置 LRU 缓存，重复文本生成性能提升 10-100 倍。
  - title: 🎨 丰富样式
    details: 支持圆角、渐变、Logo 区域、多种主题风格。
  - title: 🔧 TypeScript
    details: 完整的类型定义，提供优秀的开发体验。
---

## 快速安装

:::code-group

```bash [npm]
npm install @veaba/qrcode-wasm
```

```bash [pnpm]
pnpm add @veaba/qrcode-wasm
```

```bash [yarn]
yarn add @veaba/qrcode-wasm
```

:::

## 简单使用

```typescript
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

// 初始化 WASM
await init();

// 创建 QRCode
const qr = new QRCodeWasm();
qr.make_code('https://example.com');

// 获取 SVG
const svg = qr.get_svg();
console.log(svg);
```

## 包对比

| 包名 | 环境 | 特点 | 适用场景 |
|------|------|------|----------|
| `@veaba/qrcode-wasm` | 浏览器 | Rust WASM，性能最佳 | 前端生产环境 |
| `@veaba/qrcodejs` | 浏览器 | 纯 JavaScript，兼容性好 | 无需 WASM 的场景 |
| `@veaba/qrcode-node` | Node.js | 服务端渲染，支持 PNG | Node.js 后端 |
| `@veaba/qrcode-ts` | Bun | Bun 运行时优化 | 边缘计算、Deno |
| `@veaba/qrcode-rust` | Rust | 原生性能，内存安全 | Rust 项目 |
| `@veaba/shared` | 通用 | 共享核心，缓存系统 | 所有包的依赖 |

## 性能对比

| 运行时 | 单条生成 | 批量 1000 条 | 特点 |
|--------|---------|-------------|------|
| WASM (浏览器) | ~15,000 ops/s | ~6,000 ops/s | 前端最快 |
| Bun | ~15,000 ops/s | ~17,000 ops/s | 启动快，批量优 |
| Node.js | ~10,000 ops/s | ~6,000 ops/s | 生态丰富 |
| Rust 原生 | ~70,000 ops/s | ~80,000 ops/s | 极致性能 |

> 测试环境：AMD Ryzen 7 5800X，数据仅供参考。

## 许可证

[MIT](https://github.com/veaba/wasm-qrcode/blob/main/LICENSE)
