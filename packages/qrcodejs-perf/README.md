# qrcodejs-perf

无缓存的优化版 QRCode JavaScript 实现。

## 简介

基于 `@veaba/shared` 核心库构建，专注于性能优化，不包含缓存机制，适合每次生成不同内容的场景。

## 安装

```bash
npm install qrcodejs-perf
# 或
pnpm add qrcodejs-perf
# 或
yarn add qrcodejs-perf
```

## 特性

- 🚀 **高性能** - 使用 Uint8Array 优化内存，无缓存开销
- 🚀 **SVG Path 合并** - 减少 DOM 节点数，提升渲染性能
- 🚀 **轻量级** - 无缓存机制，内存占用更低
- 🚀 **批量生成** - 支持批量和异步生成
- 🚀 **多种样式** - 内置多种流行风格（微信、抖音、小红书等）
- 🚀 **Web Worker 支持** - 支持异步生成避免阻塞主线程

## 使用方法

### 基础用法

```javascript
import { QRCode, QRErrorCorrectLevel } from 'qrcodejs-perf';

// 创建 QRCode 实例
const qr = new QRCode('Hello World', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.get_svg();
// 或指定大小
const svg256 = qr.toSVG(256);
```

### 样式生成

```javascript
import {
  generate_rounded_qrcode,
  generate_gradient_qrcode,
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode
} from 'qrcodejs-perf';

// 生成圆角二维码
const svg1 = generate_rounded_qrcode('Hello', 256, 8);

// 生成渐变二维码
const svg2 = generate_gradient_qrcode('Hello', 256, '#667eea', '#764ba2');

// 微信风格
const svg3 = generate_wechat_style_qrcode('Hello');

// 抖音风格
const svg4 = generate_douyin_style_qrcode('Hello');
```

### 支持的样式

| 函数 | 说明 |
|------|------|
| `generate_rounded_qrcode(text, size, radius)` | 圆角二维码 |
| `generate_qrcode_with_logo_area(text, size, logoRatio)` | 带 Logo 区域 |
| `generate_gradient_qrcode(text, size, color1, color2)` | 渐变二维码 |
| `generate_wechat_style_qrcode(text, size)` | 微信风格（绿色） |
| `generate_douyin_style_qrcode(text, size)` | 抖音风格（蓝红渐变） |
| `generate_alipay_style_qrcode(text, size)` | 支付宝风格 |
| `generate_xiaohongshu_style_qrcode(text, size)` | 小红书风格（红色） |
| `generate_cyberpunk_style_qrcode(text, size)` | 赛博朋克风格 |
| `generate_retro_style_qrcode(text, size)` | 复古风格 |
| `generate_minimal_style_qrcode(text, size)` | 极简风格 |

### 批量和异步生成

```javascript
import {
  generateBatchQRCodes,
  generateQRCodeAsync,
  generateBatchAsync
} from 'qrcodejs-perf';

// 批量生成
const texts = ['text1', 'text2', 'text3'];
const svgs = generateBatchQRCodes(texts, {
  styled: true,
  style: { borderRadius: 8 }
});

// 异步生成
const result = await generateQRCodeAsync('Hello', {
  styled: true,
  style: { gradient: { color1: '#667eea', color2: '#764ba2' } }
});
// { text, svg, moduleCount }

// 批量异步生成
const results = await generateBatchAsync(['text1', 'text2']);
```

### 自定义样式

```javascript
const qr = new QRCode('Hello World');

const svg = qr.get_styled_svg({
  colorDark: '#000000',      // 深色颜色
  colorLight: '#ffffff',     // 浅色颜色
  borderRadius: 8,           // 圆角半径
  quietZone: 2,              // 静默区大小
  gradient: {                // 渐变（可选）
    color1: '#667eea',
    color2: '#764ba2'
  },
  logoRegions: [{            // Logo 区域（可选）
    row: 10,
    col: 10,
    size: 6
  }]
});
```

## 与 qrcodejs-cache 的区别

| 特性 | qrcodejs-perf | qrcodejs-cache |
|------|---------------|----------------|
| 缓存机制 | ❌ 无缓存 | ✅ LRU 缓存 |
| 适用场景 | 每次生成不同内容 | 重复生成相同内容 |
| 内存占用 | 较低 | 较高（缓存） |
| 重复生成性能 | 一般 | 优秀（缓存命中） |

## 适用场景

- ✅ 批量生成不同的 QRCode
- ✅ 内存敏感的应用
- ✅ 不需要重复生成相同内容的场景
- ✅ 服务端渲染

## 依赖

- `@veaba/shared` - 核心共享库

## License

MIT
