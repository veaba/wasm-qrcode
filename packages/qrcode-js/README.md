# @veaba/qrcode-js

浏览器兼容的 QRCode 库 - 纯 JavaScript 实现。

## 简介

这是一个浏览器友好的 QRCode 生成库，不依赖 Node.js 特有的 API，可直接在浏览器中使用。

与 `@veaba/qrcode-wasm` 提供**完全一致的 API**，方便在两个包之间无缝切换。

## 安装

```bash
npm install @veaba/qrcode-js
# 或
pnpm add @veaba/qrcode-js
# 或
yarn add @veaba/qrcode-js
```

## 特性

- 🌐 **浏览器优先** - 纯 JavaScript，无 Node.js 依赖
- 🚀 **高性能** - 优化的 QRCode 生成算法
- 💾 **可选缓存** - LRU 缓存支持，重复文本性能提升 10 倍+
- 🎨 **丰富样式** - 支持 10+ 种个性样式
- 📦 **批量生成** - 支持批量异步生成
- 🖼️ **SVG 输出** - 生成矢量图形，清晰锐利
- 🔧 **TypeScript 支持** - 包含类型定义文件
- 🔄 **API 统一** - 与 `@veaba/qrcode-wasm` 完全一致的 API

## 使用方法

### 基础用法

```javascript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-js';

// 创建 QRCode 实例
const qr = new QRCodeCore('Hello World', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG(256);

// 插入到页面
document.getElementById('qrcode').innerHTML = svg;
```

### 使用缓存（推荐）

对于重复文本，使用缓存版本可大幅提升性能：

```javascript
import { 
  generateRoundedQRCodeCached,
  clearQRCodeCache,
  getCacheStats
} from '@veaba/qrcode-js';

// 第一次生成会缓存
const svg1 = generateRoundedQRCodeCached('https://example.com', 256, 8);

// 第二次生成直接从缓存读取，速度提升 10 倍+
const svg2 = generateRoundedQRCodeCached('https://example.com', 256, 8);

// 查看缓存状态
console.log(getCacheStats()); // { size: 1, maxSize: 100, keys: [...] }

// 清空缓存
clearQRCodeCache();
```

### 不使用缓存（纯计算）

```javascript
import { generateRoundedQRCode } from '@veaba/qrcode-js';

// 每次都会重新计算
const svg = generateRoundedQRCode('https://example.com', 256, 8);
```

### 样式化二维码

```javascript
import { 
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateCyberpunkStyleQRCode 
} from '@veaba/qrcode-js';

// 微信风格
const wechatQR = generateWechatStyleQRCode('https://weixin.qq.com', 256);

// 抖音风格
const douyinQR = generateDouyinStyleQRCode('https://douyin.com', 256);

// 赛博朋克风格
const cyberQR = generateCyberpunkStyleQRCode('https://example.com', 256);
```

### 批量生成

```javascript
import { generateBatchQRCodes, generateBatchQRCodesCached } from '@veaba/qrcode-js';

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

```javascript
import { generateQRCodeAsync, generateBatchAsync } from '@veaba/qrcode-js';

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

## API

### QRCodeCore 类

#### 构造函数

```javascript
new QRCodeCore(text: string, correctLevel?: QRErrorCorrectLevel)
```

#### 方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `toSVG(size?: number)` | `string` | 生成 SVG 字符串 |
| `toStyledSVG(options?: StyledSVGOptions)` | `string` | 生成带样式的 SVG |
| `isDark(row: number, col: number)` | `boolean` | 判断指定位置是否为深色 |
| `getModuleCount()` | `number` | 获取模块数量 |

### 缓存管理

| 函数 | 说明 |
|------|------|
| `getCachedQRCode(text, correctLevel)` | 获取缓存的 QRCode |
| `clearQRCodeCache()` | 清空缓存 |
| `getCacheStats()` | 获取缓存统计信息 |
| `configureCache(options)` | 配置缓存选项 |

### 样式生成函数

所有样式函数都有缓存和非缓存两个版本：

| 非缓存版本 | 缓存版本 | 说明 |
|-----------|---------|------|
| `generateRoundedQRCode` | `generateRoundedQRCodeCached` | 圆角二维码 |
| `generateQRCodeWithLogoArea` | `generateQRCodeWithLogoAreaCached` | 带 Logo 区域 |
| `generateGradientQRCode` | `generateGradientQRCodeCached` | 渐变二维码 |
| `generateWechatStyleQRCode` | `generateWechatStyleQRCodeCached` | 微信风格 |
| `generateDouyinStyleQRCode` | `generateDouyinStyleQRCodeCached` | 抖音风格 |
| `generateAlipayStyleQRCode` | `generateAlipayStyleQRCodeCached` | 支付宝风格 |
| `generateXiaohongshuStyleQRCode` | `generateXiaohongshuStyleQRCodeCached` | 小红书风格 |
| `generateCyberpunkStyleQRCode` | `generateCyberpunkStyleQRCodeCached` | 赛博朋克风格 |
| `generateRetroStyleQRCode` | `generateRetroStyleQRCodeCached` | 复古风格 |
| `generateMinimalStyleQRCode` | `generateMinimalStyleQRCodeCached` | 极简风格 |

### 批量/异步函数

| 函数 | 说明 |
|------|------|
| `generateBatchQRCodes(texts, options?)` | 批量生成 |
| `generateBatchQRCodesCached(texts, options?)` | 批量生成（缓存） |
| `generateQRCodeAsync(text, options?)` | 异步生成 |
| `generateBatchAsync(texts, options?)` | 批量异步生成 |

### 错误纠正级别

```javascript
const QRErrorCorrectLevel = {
  L: 1,  // 低 (~7%)
  M: 0,  // 中 (~15%)
  Q: 3,  // 较高 (~25%)
  H: 2   // 高 (~30%)
};
```

## 与 @veaba/qrcode-wasm 的对比

| 特性 | @veaba/qrcode-js | @veaba/qrcode-wasm |
|------|------------------|-------------------|
| 性能 | 快 | 更快 |
| 包大小 | ~15KB | ~45KB |
| 初始化 | 即时 | 需要异步初始化 |
| 兼容性 | IE11+ | 现代浏览器 |
| API | 统一 ✅ | 统一 ✅ |

选择 `@veaba/qrcode-js`：
- ✅ 需要支持 IE11 等旧浏览器
- ✅ 对包大小敏感
- ✅ 不想处理 WASM 的异步初始化
- ✅ 生成频率不高，性能不是瓶颈

选择 `@veaba/qrcode-wasm`：
- ✅ 追求极致性能
- ✅ 高频批量生成
- ✅ 现代浏览器环境

## 性能对比

| 场景 | 非缓存 | 缓存 | 提升 |
|------|--------|------|------|
| 单条生成 | ~35,000 ops/s | ~150,000 ops/s | **4.3x** |
| 批量 100 条 | ~3,500 ops/s | ~15,000 ops/s | **4.3x** |
| 重复文本 | ~35,000 ops/s | ~500,000+ ops/s | **14x+** |

*测试环境：Chrome 120, Intel i7-1165G7*

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 监听模式
npm run watch
```

## 相关包

- `@veaba/qrcode-wasm` - Rust WASM 版本（性能最佳，API 一致）
- `@veaba/qrcode-node` - Node.js 版本
- `@veaba/qrcode-bun` - Bun 运行时版本
- `@veaba/qrcode-shared` - 共享核心库

## License

MIT
