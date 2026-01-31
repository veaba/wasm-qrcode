# qrcodejs-cache

带 LRU 缓存的优化版 QRCode JavaScript 实现。

## 简介

基于 `@veaba/qrcode-shared` 核心库构建，提供 LRU 缓存机制以避免重复计算相同文本的 QRCode。

## 安装

```bash
npm install qrcodejs-cache
# 或
pnpm add qrcodejs-cache
# 或
yarn add qrcodejs-cache
```

## 特性

- ✅ **LRU 缓存** - 自动缓存最近使用的 100 个 QRCode 实例
- ✅ **高性能** - 使用 Uint8Array 优化内存
- ✅ **SVG Path 合并** - 减少 DOM 节点数
- ✅ **批量生成** - 支持批量和异步生成
- ✅ **多种样式** - 内置多种流行风格（微信、抖音、小红书等）
- ✅ **Web Worker 支持** - 支持异步生成避免阻塞主线程

## 使用方法

### 基础用法

```javascript
import { QRCode, QRErrorCorrectLevel } from 'qrcodejs-cache';

// 创建 QRCode 实例
const qr = new QRCode('Hello World', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.get_svg();
// 或指定大小
const svg256 = qr.toSVG(256);
```

### 使用缓存的样式生成

```javascript
import {
  generate_rounded_qrcode,
  generate_gradient_qrcode,
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode,
  clearQRCodeCache,
  getCacheStats
} from 'qrcodejs-cache';

// 生成圆角二维码（会使用缓存）
const svg1 = generate_rounded_qrcode('Hello', 256, 8);

// 再次生成相同文本，直接从缓存读取
const svg2 = generate_rounded_qrcode('Hello', 256, 8);

// 生成渐变二维码
const svg3 = generate_gradient_qrcode('Hello', 256, '#667eea', '#764ba2');

// 微信风格
const svg4 = generate_wechat_style_qrcode('Hello');

// 抖音风格
const svg5 = generate_douyin_style_qrcode('Hello');

// 查看缓存状态
console.log(getCacheStats());
// { size: 3, maxSize: 100, keys: ['Hello:2', ...] }

// 清空缓存
clearQRCodeCache();
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
} from 'qrcodejs-cache';

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

## 缓存机制

- **最大缓存数**: 100 个 QRCode 实例
- **淘汰策略**: LRU（最近最少使用）
- **缓存键**: `${text}:${correctLevel}`

## 与 qrcodejs-perf 的区别

| 特性 | qrcodejs-cache | qrcodejs-perf |
|------|----------------|---------------|
| 缓存机制 | ✅ LRU 缓存 | ❌ 无缓存 |
| 适用场景 | 重复生成相同内容 | 每次生成不同内容 |
| 内存占用 | 较高（缓存） | 较低 |

## 依赖

- `@veaba/qrcode-shared` - 核心共享库

## License

MIT
