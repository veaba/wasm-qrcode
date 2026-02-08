# API 参考

QRCode 生成器的完整 API 文档。

## 包概览

| 包名 | 环境 | 主要导出 | 说明 |
|------|------|---------|------|
| `@veaba/qrcode-js` | 浏览器 | `QRCodeCore`, `QRErrorCorrectLevel` | 纯 JavaScript，即时启动 |
| `@veaba/qrcode-wasm` | 浏览器 | `QRCodeCore`, `QRErrorCorrectLevel`, `init` | Rust WASM，性能最佳 |
| `@veaba/qrcode-node` | Node.js | `QRCode`, `QRErrorCorrectLevel` | Node.js 环境 |
| `@veaba/qrcode-bun` | Bun | `QRCode`, `QRErrorCorrectLevel` | Bun 运行时 |
| `@veaba/qrcode-rust` | Rust | `QRCode`, `QRErrorCorrectLevel` | 纯 Rust crate |
| `@veaba/js-shared` | 通用 | `QRCodeCore`, 工具函数 | 内部共享包 |

## 统一 API

`@veaba/qrcode-js` 和 `@veaba/qrcode-wasm` 提供完全一致的 API：

### 快速开始

```typescript
// JavaScript 版本
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-js';

const qr = new QRCodeCore('Hello World', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
```

```typescript
// WASM 版本
import init, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

await init();
const qr = new QRCodeCore('Hello World', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
```

## 快速导航

- [QRCodeCore](./core) - 核心 QRCode 类
- [QRCodeWasm](./wasm) - WASM 特定 API
- [缓存系统](./cache) - LRU 缓存 API

## 类型定义

### QRErrorCorrectLevel

所有包共用的纠错级别枚举：

```typescript
enum QRErrorCorrectLevel {
  L = 1,  // ~7% 容错
  M = 0,  // ~15% 容错（默认）
  Q = 3,  // ~25% 容错
  H = 2   // ~30% 容错
}
```

### QRCodeOptions

```typescript
interface QRCodeOptions {
  text: string;
  correctLevel?: QRErrorCorrectLevel;
  size?: number;
  colorDark?: string;
  colorLight?: string;
}
```

### StyledSVGOptions

```typescript
interface StyledSVGOptions {
  size?: number;           // 默认 256
  colorDark?: string;      // 默认 '#000000'
  colorLight?: string;     // 默认 '#ffffff'
  borderRadius?: number;   // 默认 0
  gradient?: {             // 默认 null
    color1: string;
    color2: string;
  } | null;
  quietZone?: number;      // 默认 0
  logoRegions?: Array<{    // 默认 []
    row: number;
    col: number;
    size: number;
  }>;
}
```

## 通用方法

所有 QRCode 类都支持以下方法：

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `toSVG(size?)` | 生成 SVG | `size?: number` | `string` |
| `toStyledSVG(options?)` | 样式化 SVG | `options?: StyledSVGOptions` | `string` |
| `getModuleCount()` | 获取模块数 | - | `number` |
| `isDark(row, col)` | 判断模块颜色 | `row: number, col: number` | `boolean` |

## 样式生成函数

### 基础样式

| 函数 | 参数 | 说明 |
|------|------|------|
| `generateRoundedQRCode(text, size?, radius?)` | `string, number?, number?` | 圆角二维码 |
| `generateQRCodeWithLogoArea(text, size?, logoRatio?)` | `string, number?, number?` | 带 Logo 区域 |
| `generateGradientQRCode(text, size?, color1?, color2?)` | `string, number?, string?, string?` | 渐变二维码 |

### 平台风格

| 函数 | 参数 | 说明 |
|------|------|------|
| `generateWechatStyleQRCode(text, size?)` | `string, number?` | 微信绿色风格 |
| `generateDouyinStyleQRCode(text, size?)` | `string, number?` | 抖音黑底彩色风格 |
| `generateAlipayStyleQRCode(text, size?)` | `string, number?` | 支付宝蓝色风格 |
| `generateXiaohongshuStyleQRCode(text, size?)` | `string, number?` | 小红书红色风格 |
| `generateCyberpunkStyleQRCode(text, size?)` | `string, number?` | 赛博朋克霓虹风格 |
| `generateRetroStyleQRCode(text, size?)` | `string, number?` | 复古 sepia 风格 |
| `generateMinimalStyleQRCode(text, size?)` | `string, number?` | 极简风格 |

### 缓存版本

所有样式函数都有对应的缓存版本（函数名后加 `Cached`）：

| 非缓存版本 | 缓存版本 |
|-----------|---------|
| `generateRoundedQRCode` | `generateRoundedQRCodeCached` |
| `generateGradientQRCode` | `generateGradientQRCodeCached` |
| `generateWechatStyleQRCode` | `generateWechatStyleQRCodeCached` |
| ... | ... |

## 批量/异步生成

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `generateBatchQRCodes(texts, options?)` | `string[], QRCodeOptions?` | `string[]` | 批量生成 |
| `generateBatchQRCodesCached(texts, options?)` | `string[], QRCodeOptions?` | `string[]` | 批量生成（缓存） |
| `generateQRCodeAsync(text, options?)` | `string, QRCodeOptions?` | `Promise<QRCodeResult>` | 异步生成 |
| `generateBatchAsync(texts, options?)` | `string[], QRCodeOptions?` | `Promise<QRCodeResult[]>` | 批量异步 |

## 缓存管理

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCachedQRCode(text, correctLevel?)` | `string, QRErrorCorrectLevel?` | `QRCodeCore` | 获取缓存的 QRCode |
| `clearQRCodeCache()` | - | `void` | 清空缓存 |
| `getCacheStats()` | - | `{ size, maxSize, keys }` | 获取缓存统计 |
| `configureCache(options)` | `CacheOptions` | `void` | 配置缓存 |

## 示例代码

### 浏览器 (JS)

```typescript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-js';

const qr = new QRCodeCore('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
```

### 浏览器 (WASM)

```typescript
import init, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

await init();
const qr = new QRCodeCore('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);
```

### Node.js

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
const png = qr.toPNG();
```

### Bun

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-bun';

const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
```

### Rust

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

let mut qr = QRCode::new();
qr.make_code("https://github.com/veaba/qrcodes");
let svg = qr.get_svg();
```

## 包选择指南

| 场景 | 推荐包 | 原因 |
|------|--------|------|
| 现代浏览器，追求性能 | `@veaba/qrcode-wasm` | 性能最佳 |
| 需要兼容 IE11 | `@veaba/qrcode-js` | 纯 JS，兼容性好 |
| 对包大小敏感 | `@veaba/qrcode-js` | 体积更小 (~15KB) |
| Node.js 后端 | `@veaba/qrcode-node` | Node 专用 API |
| Bun 运行时 | `@veaba/qrcode-bun` | Bun 优化 |
| Rust 项目 | `@veaba/qrcode-rust` | 原生 Rust crate |
