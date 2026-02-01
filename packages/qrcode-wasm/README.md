# @veaba/qrcode-wasm

WebAssembly QRCode 生成器 - 基于 Rust 编译，提供优秀的 QRCode 生成性能。

## 简介

基于 Rust 实现并编译为 WebAssembly 的 QRCode 生成器，提供接近原生的执行速度。

与 `@veaba/qrcode-js` 提供**完全一致的 API**，方便在两个包之间无缝切换。

## 特性

- ⚡ **高性能** - Rust + WASM 提供接近原生的执行速度
- ⚡ **并行计算** - 支持多线程并行生成（需配置）
- 💾 **可选缓存** - LRU 缓存支持，重复文本性能提升 10 倍+
- 🎨 **丰富样式** - 支持 10+ 种个性样式
- 📦 **批量生成** - 支持批量异步生成
- 🖼️ **SVG 输出** - 生成矢量图形，清晰锐利
- 🔧 **TypeScript 支持** - 包含类型定义文件
- 🔄 **API 统一** - 与 `@veaba/qrcode-js` 完全一致的 API

## 安装

```bash
npm install @veaba/qrcode-wasm
# 或
pnpm add @veaba/qrcode-wasm
# 或
yarn add @veaba/qrcode-wasm
```

## 使用方法

### 基础用法（统一 API）

```typescript
import init, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

// 初始化 WASM（只需一次）
await init();

// 创建 QRCode 实例（与 qrcode-js 相同的 API）
const qr = new QRCodeCore('Hello World', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG(256);

// 插入到页面
document.getElementById('qrcode').innerHTML = svg;
```

### 使用缓存（推荐）

```typescript
import init, { 
  generateRoundedQRCodeCached,
  clearQRCodeCache,
  getCacheStats 
} from '@veaba/qrcode-wasm';

await init();

// 第一次生成会缓存
const svg1 = generateRoundedQRCodeCached('https://example.com', 256, 8);

// 第二次生成直接从缓存读取，速度提升 10 倍+
const svg2 = generateRoundedQRCodeCached('https://example.com', 256, 8);

// 查看缓存状态
console.log(getCacheStats()); // { size: 1, maxSize: 100, keys: [...] }

// 清空缓存
clearQRCodeCache();
```

### 样式化二维码

```typescript
import init, { 
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateCyberpunkStyleQRCode 
} from '@veaba/qrcode-wasm';

await init();

// 微信风格
const wechatQR = generateWechatStyleQRCode('https://weixin.qq.com', 256);

// 抖音风格
const douyinQR = generateDouyinStyleQRCode('https://douyin.com', 256);

// 赛博朋克风格
const cyberQR = generateCyberpunkStyleQRCode('https://example.com', 256);
```

### 批量生成

```typescript
import init, { generateBatchQRCodes, generateBatchQRCodesCached } from '@veaba/qrcode-wasm';

await init();

const texts = [
  'https://example.com/1',
  'https://example.com/2',
  // ... 更多
];

// 非缓存版本
const svgs = generateBatchQRCodes(texts, { size: 256 });

// 缓存版本
const svgsCached = generateBatchQRCodesCached(texts, { size: 256 });
```

### 异步生成

```typescript
import init, { generateQRCodeAsync, generateBatchAsync } from '@veaba/qrcode-wasm';

await init();

// 单个异步生成
const result = await generateQRCodeAsync('https://example.com', {
  size: 256,
  cache: true // 启用缓存
});
console.log(result.svg);

// 批量异步生成
const results = await generateBatchAsync(texts, {
  size: 256,
  cache: true
});
```

## 底层 WASM API（可选）

如果需要更底层的控制，可以直接使用 WASM 原生 API：

```typescript
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 使用底层 WASM API
const qr = new QRCodeWasm();
qr.make_code('https://github.com/veaba/qrcodes');
const svg = qr.get_svg();
```

### 使用 QRCodeGenerator（可复用实例）

```typescript
import init, { QRCodeGenerator, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 创建可复用的生成器
const gen = new QRCodeGenerator();

// 设置选项
gen.set_options(256, 256, CorrectLevel.H);

// 生成单个 QRCode
gen.generate('https://github.com/veaba/qrcodes/1');
const svg1 = gen.get_svg();

// 复用同一实例生成另一个（性能更好）
gen.generate('https://github.com/veaba/qrcodes/2');
const svg2 = gen.get_svg();

// 批量生成
const texts = ['url1', 'url2', 'url3'];
const svgs = gen.generate_batch(texts);
```

### Canvas 渲染

```typescript
import init, { CanvasRenderer } from '@veaba/qrcode-wasm';

await init();

// 创建 Canvas 渲染器
const renderer = new CanvasRenderer(256, 256);

// 设置颜色（RGBA）
renderer.set_colors(
  0, 0, 0, 255,      // 深色: 黑色
  255, 255, 255, 255 // 浅色: 白色
);

// 渲染 QRCode
const pixelData = renderer.render('https://github.com/veaba/qrcodes', CorrectLevel.H);
```

## API

### 统一 API（与 qrcode-js 一致）

| 类/函数 | 说明 |
|---------|------|
| `QRCodeCore` | 核心 QRCode 类 |
| `QRErrorCorrectLevel` | 纠错级别枚举 |
| `generateRoundedQRCode` / `generateRoundedQRCodeCached` | 圆角二维码 |
| `generateGradientQRCode` / `generateGradientQRCodeCached` | 渐变二维码 |
| `generateWechatStyleQRCode` / `generateWechatStyleQRCodeCached` | 微信风格 |
| `generateDouyinStyleQRCode` / `generateDouyinStyleQRCodeCached` | 抖音风格 |
| `generateBatchQRCodes` / `generateBatchQRCodesCached` | 批量生成 |
| `generateQRCodeAsync` | 异步生成 |
| `getCachedQRCode` | 获取缓存 |
| `clearQRCodeCache` | 清空缓存 |

### 底层 WASM API

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `new()` | 创建实例 | `QRCodeWasm` |
| `with_options(w, h, level)` | 带选项创建 | `QRCodeWasm` |
| `make_code(text)` | 生成 QRCode | `void` |
| `get_svg()` | 获取 SVG | `string` |
| `get_module_count()` | 获取模块数 | `number` |
| `get_modules_json()` | 获取模块数据 | `string` |
| `is_dark(row, col)` | 判断模块颜色 | `boolean` |

## 与 @veaba/qrcode-js 的对比

| 特性 | @veaba/qrcode-wasm | @veaba/qrcode-js |
|------|-------------------|------------------|
| 性能 | ⚡⚡⚡ 最快 | ⚡⚡ 快 |
| 包大小 | ~45KB | ~15KB |
| 初始化 | 需要异步 | 即时 |
| 兼容性 | 现代浏览器 | IE11+ |
| API | 统一 ✅ | 统一 ✅ |

选择 `@veaba/qrcode-wasm`：
- ✅ 追求极致性能
- ✅ 高频批量生成
- ✅ 现代浏览器环境

选择 `@veaba/qrcode-js`：
- ✅ 需要支持 IE11 等旧浏览器
- ✅ 对包大小敏感
- ✅ 不想处理 WASM 的异步初始化

## 性能对比

| 场景 | @veaba/qrcode-js | @veaba/qrcode-wasm | 提升 |
|------|------------------|-------------------|------|
| 单条生成 | ~9,000 ops/s | ~15,000 ops/s | **1.7x** |
| SVG 输出 | ~9,800 ops/s | ~17,000 ops/s | **1.7x** |
| 缓存命中 | ~500,000 ops/s | ~500,000 ops/s | 相同 |

*测试环境：Chrome 120, Intel i7-1165G7*

## 开发

### 环境要求

- Rust
- wasm-pack
- Node.js

### 构建

```bash
# 安装 wasm-pack
cargo install wasm-pack

# 构建 WASM
wasm-pack build --target web

# 构建 Node.js 版本
wasm-pack build --target nodejs
```

### 运行测试

```bash
# Rust 测试
cargo test

# TypeScript 测试
npm test
```

### 构建发布版本

```bash
# 优化构建
wasm-pack build --release --target web
```

## 相关包

- `@veaba/qrcode-js` - 纯 JavaScript 版本（API 一致）
- `@veaba/qrcode-node` - Node.js 版本
- `@veaba/qrcode-bun` - Bun 运行时版本
- `@veaba/qrcode-shared` - 共享核心库

## License

MIT
