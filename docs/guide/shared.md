# @veaba/qrcode-shared

共享核心库，包含 QRCode 生成的核心算法、类型定义、缓存系统和工具函数。所有其他包都依赖此库。

## 安装

通常不需要单独安装，其他包会自动依赖：

```bash
npm install @veaba/qrcode-shared
```

## 核心功能

### 1. QRCodeCore - 核心类

```typescript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-shared';

// 创建 QRCode
const qr = new QRCodeCore('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG(256);

// 获取样式化 SVG
const styledSvg = qr.toStyledSVG({
  size: 256,
  borderRadius: 8,
  gradient: { color1: '#667eea', color2: '#764ba2' }
});
```

### 2. LRU 缓存系统

```typescript
import { 
  getCachedQRCode, 
  clearQRCodeCache, 
  getCacheStats,
  configureCache 
} from '@veaba/qrcode-shared';

// 获取缓存的 QRCode（如果不存在则创建并缓存）
const qr = getCachedQRCode('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);

// 查看缓存统计
console.log(getCacheStats());
// { size: 5, maxSize: 100, keys: ['https://github.com/veaba/wasm-qrcode:2', ...] }

// 清空缓存
clearQRCodeCache();

// 配置缓存（高级用法）
configureCache({ maxSize: 200, enabled: true });
```

### 3. 预设样式函数

#### 基础样式

```typescript
import {
  generateRoundedQRCode,
  generateGradientQRCode,
  generateQRCodeWithLogoArea
} from '@veaba/qrcode-shared';

// 圆角 QRCode
const svg1 = generateRoundedQRCode('https://github.com/veaba/wasm-qrcode', 256, 8);

// 渐变 QRCode
const svg2 = generateGradientQRCode('https://github.com/veaba/wasm-qrcode', 256, '#667eea', '#764ba2');

// 带 Logo 区域
const svg3 = generateQRCodeWithLogoArea('https://github.com/veaba/wasm-qrcode', 256, 0.2);
```

#### 主题风格

```typescript
import {
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateAlipayStyleQRCode,
  generateCyberpunkStyleQRCode,
  generateRetroStyleQRCode,
  generateMinimalStyleQRCode,
  generateXiaohongshuStyleQRCode
} from '@veaba/qrcode-shared';

// 各种主题风格
const wechat = generateWechatStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const douyin = generateDouyinStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const alipay = generateAlipayStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const cyberpunk = generateCyberpunkStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const retro = generateRetroStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const minimal = generateMinimalStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
const xiaohongshu = generateXiaohongshuStyleQRCode('https://github.com/veaba/wasm-qrcode', 256);
```

#### 带缓存的样式函数

```typescript
import {
  generateRoundedQRCodeCached,
  generateGradientQRCodeCached,
  generateWechatStyleQRCodeCached,
  // ... 其他带 Cached 后缀的函数
} from '@veaba/qrcode-shared';

// 使用缓存版本，重复文本性能提升 10-100 倍
const svg = generateRoundedQRCodeCached('https://github.com/veaba/wasm-qrcode', 256, 8);
```

### 4. 批量生成

```typescript
import { 
  generateBatchQRCodes, 
  generateBatchQRCodesCached,
  generateBatchAsync 
} from '@veaba/qrcode-shared';

const texts = ['url1', 'url2', 'url3'];

// 同步批量生成
const svgs = generateBatchQRCodes(texts, {
  correctLevel: QRErrorCorrectLevel.H,
  size: 256
});

// 带缓存的批量生成
const cachedSvgs = generateBatchQRCodesCached(texts, {
  correctLevel: QRErrorCorrectLevel.H,
  size: 256,
  styled: true,
  style: { borderRadius: 8 }
});

// 异步批量生成
const asyncSvgs = await generateBatchAsync(texts, {
  correctLevel: QRErrorCorrectLevel.H,
  size: 256
});
```

### 5. 异步生成

```typescript
import { 
  generateQRCodeAsync, 
  generateQRCodeAsyncAdvanced 
} from '@veaba/qrcode-shared';

// 简单异步生成
const svg = await generateQRCodeAsync('https://github.com/veaba/wasm-qrcode', {
  correctLevel: QRErrorCorrectLevel.H,
  size: 256
});

// 高级异步生成
const result = await generateQRCodeAsyncAdvanced('https://github.com/veaba/wasm-qrcode', {
  correctLevel: QRErrorCorrectLevel.H,
  size: 256,
  styled: true,
  style: { borderRadius: 8 },
  cache: true  // 使用缓存
});

console.log(result.text);      // 输入文本
console.log(result.svg);       // SVG 字符串
console.log(result.moduleCount); // 模块数量
```

## 类型定义

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
  size?: number;
  colorDark?: string;
  colorLight?: string;
  borderRadius?: number;
  gradient?: { color1: string; color2: string } | null;
  quietZone?: number;
  logoRegions?: Array<{ row: number; col: number; size: number }>;
}
```

### CacheOptions

```typescript
interface CacheOptions {
  maxSize?: number;  // 默认 100
  enabled?: boolean; // 默认 true
}
```

### AsyncQRCodeOptions

```typescript
interface AsyncQRCodeOptions extends Partial<QRCodeOptions> {
  styled?: boolean;
  style?: StyledSVGOptions;
  cache?: boolean;
}
```

### QRCodeResult

```typescript
interface QRCodeResult {
  text: string;
  svg: string;
  moduleCount: number;
}
```

## 常量

### 纠错级别

```typescript
enum QRErrorCorrectLevel {
  L = 1,  // ~7% 容错
  M = 0,  // ~15% 容错
  Q = 3,  // ~25% 容错
  H = 2   // ~30% 容错
}
```

### QR 模式

```typescript
const QRMode = {
  MODE_8BIT_BYTE: 4
};
```

## 内部工具

### Galois Field 数学运算

```typescript
import { QRMath } from '@veaba/qrcode-shared';

// Galois Field 指数运算
const exp = QRMath.gexp(100);

// Galois Field 对数运算
const log = QRMath.glog(200);
```

### 多项式运算

```typescript
import { Polynomial } from '@veaba/qrcode-shared';

// 创建多项式
const p1 = new Polynomial([1, 2, 3]);
const p2 = new Polynomial([4, 5]);

// 乘法
const product = p1.multiply(p2);

// 取模
const remainder = p1.mod(p2);
```

### 获取 RS Blocks

```typescript
import { getRSBlocks, QRErrorCorrectLevel } from '@veaba/qrcode-shared';

const rsBlocks = getRSBlocks(2, QRErrorCorrectLevel.H);
// [{ totalCount: 26, dataCount: 16 }, ...]
```

### 获取 Type Number

```typescript
import { getTypeNumber, QRErrorCorrectLevel } from '@veaba/qrcode-shared';

const typeNumber = getTypeNumber(100, QRErrorCorrectLevel.H);
// 根据文本长度和纠错级别计算版本号
```

## 缓存实现细节

### LRU Cache 工作原理

```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到末尾（最近使用）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的（第一个元素）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 缓存键生成

```typescript
function getCacheKey(text: string, correctLevel: QRErrorCorrectLevel): string {
  return `${text}:${correctLevel}`;
}

// 示例
getCacheKey('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);
// "https://github.com/veaba/wasm-qrcode:2"
```

## 使用场景

### 1. 需要缓存的场景

```typescript
import { getCachedQRCode } from '@veaba/qrcode-shared';

// 电商网站：商品二维码
function getProductQRCode(productId: string) {
  // 热门商品会被缓存，重复访问直接返回
  return getCachedQRCode(`https://shop.com/p/${productId}`);
}
```

### 2. 批量生成场景

```typescript
import { generateBatchQRCodesCached } from '@veaba/qrcode-shared';

// 活动门票：批量生成
const tickets = Array.from({ length: 1000 }, (_, i) => ({
  id: `TICKET-${i}`,
  url: `https://event.com/ticket/${i}`
}));

// 使用缓存批量生成
const qrCodes = generateBatchQRCodesCached(
  tickets.map(t => t.url),
  { size: 256, styled: true, style: { borderRadius: 4 } }
);
```

### 3. 服务端渲染

```typescript
import { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-shared';

// Next.js / Nuxt.js 服务端渲染
export async function getServerSideProps() {
  const qr = new QRCodeCore('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);
  return {
    props: {
      qrSvg: qr.toSVG(256)
    }
  };
}
```

## 性能提示

1. **使用缓存**：对于重复文本，使用 `getCachedQRCode` 或带 `Cached` 后缀的函数
2. **批量生成**：使用 `generateBatchQRCodes` 而不是循环调用单条生成
3. **异步处理**：大量生成时使用 `generateBatchAsync` 避免阻塞主线程
4. **合理设置缓存大小**：根据内存和访问模式调整 `maxSize`

## 架构位置

```
@veaba/qrcode-shared (共享核心)
    │
    ├── QRCodeCore (核心算法)
    ├── LRU Cache (缓存系统)
    ├── 预设样式函数
    └── 工具函数
    │
    ├──► @veaba/qrcodejs (浏览器 JS)
    ├──► @veaba/qrcode-node (Node.js)
    └──► @veaba/qrcode-ts (Bun)
```

`@veaba/qrcode-shared` 是架构的核心，所有 JavaScript/TypeScript 包都基于它构建。
