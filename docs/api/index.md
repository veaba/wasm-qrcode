# API 参考

Wasm QRCode 的完整 API 文档。

## 包概览

| 包名 | 环境 | 主要导出 |
|------|------|---------|
| `@veaba/qrcode-wasm` | 浏览器 | `QRCodeWasm`, `QRCodeGenerator`, `init` |
| `@veaba/qrcodejs` | 浏览器 | `QRCodeCore`, `QRErrorCorrectLevel` |
| `@veaba/qrcode-node` | Node.js | `QRCode`, `QRErrorCorrectLevel` |
| `@veaba/qrcode-ts` | Bun | `QRCode`, `QRErrorCorrectLevel` |
| `@veaba/qrcode-rust` | Rust | `QRCode`, `QRErrorCorrectLevel` |
| `@veaba/qrcode-shared` | 通用 | `QRCodeCore`, `LRUCache`, 工具函数 |

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

## 示例代码

### 浏览器 (WASM)

```typescript
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

await init();
const qr = new QRCodeWasm();
qr.make_code('https://github.com/veaba/wasm-qrcode');
const svg = qr.get_svg();
```

### 浏览器 (JS)

```typescript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcodejs';

const qr = new QRCodeCore('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
```

### Node.js

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

const qr = new QRCode('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
const png = qr.toPNG();
```

### Bun

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

const qr = new QRCode('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);
const svg = qr.toSVG();
```

### Rust

```rust
use qrcode_rust::{QRCode, QRErrorCorrectLevel};

let mut qr = QRCode::new();
qr.make_code("https://github.com/veaba/wasm-qrcode");
let svg = qr.get_svg();
```
