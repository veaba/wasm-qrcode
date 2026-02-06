# @veaba/qrcode-wasm

浏览器环境的 WASM 版本，基于 Rust 编译，提供优秀的 QRCode 生成性能。

## 安装

```bash
npm install @veaba/qrcode-wasm
```

## 初始化

WASM 需要异步初始化。`initWasm()` 函数**自动检测**你的构建工具环境：

- **Vite**: 自动使用 `?url` 导入 WASM 文件
- **Webpack 5**: 使用 `new URL()` 方式加载
- **Parcel**: 使用内置 WASM 支持
- **Node.js**: 使用文件系统读取

```typescript
import initWasm from '@veaba/qrcode-wasm';

// 初始化 WASM（自动检测环境，无需配置）
await initWasm();
```

> **注意**: 如果你使用 Vite 且遇到 WASM 加载问题，确保使用 `initWasm()` 而不是旧的 `init()`。

## 统一 API（推荐）

`@veaba/qrcode-wasm` 现在提供与 `@veaba/qrcode-js` 完全一致的 API，方便在两个包之间无缝切换：

### 基础用法

```typescript
import initWasm, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

// 初始化 WASM（只需一次，自动检测环境）
await initWasm();

// 创建 QRCode 实例（与 qrcode-js 相同的 API）
const qr = new QRCodeCore('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG(256);

// 插入到页面
document.getElementById('qrcode').innerHTML = svg;
```

### 使用缓存（推荐）

```typescript
import initWasm, { 
  generateRoundedQRCodeCached,
  clearQRCodeCache,
  getCacheStats 
} from '@veaba/qrcode-wasm';

await initWasm();

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
import initWasm, { 
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateCyberpunkStyleQRCode 
} from '@veaba/qrcode-wasm';

await initWasm();

// 微信风格
const wechatQR = generateWechatStyleQRCode('https://weixin.qq.com', 256);

// 抖音风格
const douyinQR = generateDouyinStyleQRCode('https://douyin.com', 256);

// 赛博朋克风格
const cyberQR = generateCyberpunkStyleQRCode('https://example.com', 256);
```

### 批量生成

```typescript
import initWasm, { generateBatchQRCodes, generateBatchQRCodesCached } from '@veaba/qrcode-wasm';

await initWasm();

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
import initWasm, { generateQRCodeAsync, generateBatchAsync } from '@veaba/qrcode-wasm';

await initWasm();

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
import initWasm, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

await initWasm();

// 使用底层 WASM API
const qr = new QRCodeWasm();
qr.make_code('https://github.com/veaba/qrcodes');
const svg = qr.get_svg();
```

### 使用 QRCodeGenerator（可复用实例）

```typescript
import initWasm, { QRCodeGenerator, CorrectLevel } from '@veaba/qrcode-wasm';

await initWasm();

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

如果需要像素数据用于 Canvas：

```typescript
import initWasm, { CanvasRenderer } from '@veaba/qrcode-wasm';

await initWasm();

// 创建 Canvas 渲染器
const renderer = new CanvasRenderer(256, 256);

// 设置颜色（RGBA）
renderer.set_colors(
  0, 0, 0, 255,      // 深色: 黑色
  255, 255, 255, 255 // 浅色: 白色
);

// 渲染 QRCode
const pixelData = renderer.render('https://github.com/veaba/qrcodes', CorrectLevel.H);

// 使用 ImageData 显示
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = new ImageData(
  new Uint8ClampedArray(pixelData), 
  256, 
  256
);
ctx.putImageData(imageData, 0, 0);
```

## 在框架中的最佳实践

### React Hook

```typescript
// hooks/useQRCode.ts
import { useEffect, useState, useCallback } from 'react';
import initWasm, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: string) {
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      if (!initialized) {
        await initWasm();
        initialized = true;
      }
      
      const qr = new QRCodeCore(text, QRErrorCorrectLevel.H);
      setSvg(qr.toSVG(256));
      setLoading(false);
    };

    generate();
  }, [text]);

  return { svg, loading };
}
```

### Vue Composable

```typescript
// composables/useQRCode.ts
import { ref, watch, onMounted } from 'vue';
import initWasm, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: Ref<string>) {
  const svg = ref('');
  const loading = ref(true);

  const generate = async () => {
    if (!initialized) {
      await initWasm();
      initialized = true;
    }
    
    const qr = new QRCodeCore(text.value, QRErrorCorrectLevel.H);
    svg.value = qr.toSVG(256);
    loading.value = false;
  };

  onMounted(generate);
  watch(text, generate);

  return { svg, loading };
}
```

## API 参考

### 统一 API（与 qrcode-js 一致）

| 类/函数 | 说明 |
|---------|------|
| `QRCodeCore` | 核心 QRCode 类 |
| `QRErrorCorrectLevel` | 纠错级别枚举 |
| `generateRoundedQRCode` | 圆角二维码 |
| `generateGradientQRCode` | 渐变二维码 |
| `generateWechatStyleQRCode` | 微信风格 |
| `generateDouyinStyleQRCode` | 抖音风格 |
| `generateBatchQRCodes` | 批量生成 |
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

## 性能提示

1. **复用实例**：使用缓存版本或 `QRCodeGenerator` 提升性能
2. **批量生成**：使用 `generateBatchQRCodes` 比循环调用更快
3. **缓存初始化**：在应用启动时初始化 WASM，避免首次生成时的延迟
4. **及时释放**：WASM 对象需要手动调用 `free()` 释放内存（底层 API）

## 与 @veaba/qrcode-js 的选择

| 特性 | @veaba/qrcode-wasm | @veaba/qrcode-js |
|------|-------------------|------------------|
| 性能 | ⚡⚡⚡ 最快 | ⚡⚡ 快 |
| 包大小 | ~45KB | ~15KB |
| 初始化 | 需要异步 | 即时 |
| 兼容性 | 现代浏览器 | IE11+ |
| API | 统一 | 统一 |

选择 `@veaba/qrcode-wasm`：
- ✅ 追求极致性能
- ✅ 现代浏览器环境
- ✅ 高频生成场景

选择 `@veaba/qrcode-js`：
- ✅ 对包大小敏感
- ✅ 需要兼容旧浏览器
- ✅ 不想处理异步初始化

## 迁移指南

从旧版本迁移到统一 API：

```typescript
// 旧版本（仍然支持）
import initWasm, { QRCodeWasm } from '@veaba/qrcode-wasm';
await initWasm();
const qr = new QRCodeWasm();
qr.make_code('text');
const svg = qr.get_svg();

// 新版本（统一 API，推荐）
import initWasm, { QRCodeCore } from '@veaba/qrcode-wasm';
await initWasm();
const qr = new QRCodeCore('text');
const svg = qr.toSVG();
```
