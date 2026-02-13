# 缓存系统

**注意：** `@veaba/qrcode-js-shared` 是内部私有包。缓存功能通过以下公开包自动提供：

- `@veaba/qrcode-js`
- `@veaba/qrcode-node`
- `@veaba/qrcode-bun`

所有公开包都包含相同的缓存 API，无需单独安装内部包。

`@veaba/qrcode-js-shared` 提供 LRU (Least Recently Used) 缓存系统，用于优化重复 QRCode 的生成性能。

## 核心概念

### 为什么需要缓存？

QRCode 生成涉及复杂的计算（Reed-Solomon 编码、模块布局等）。对于重复文本，缓存可以避免重复计算，性能提升 **10-100 倍**。

### 缓存键生成

缓存键由文本和纠错级别组合而成：

```typescript
function getCacheKey(text: string, correctLevel: QRErrorCorrectLevel): string {
  return `${text}:${correctLevel}`;
}

// 示例
getCacheKey('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
// "https://github.com/veaba/qrcodes:2"
```

## API 参考

### getCachedQRCode

获取缓存的 QRCode，如果不存在则创建并缓存。

```typescript
function getCachedQRCode(
  text: string,
  correctLevel: QRErrorCorrectLevel = QRErrorCorrectLevel.H
): QRCodeCore
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `text` | `string` | 是 | - | 要编码的文本 |
| `correctLevel` | `QRErrorCorrectLevel` | 否 | `H` | 纠错级别 |

#### 返回值

`QRCodeCore` - QRCode 实例（来自缓存或新创建）

#### 示例

```typescript
// 浏览器环境
import { getCachedQRCode, QRErrorCorrectLevel } from '@veaba/qrcode-js';
// Node.js 环境
// import { getCachedQRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

// 第一次调用：创建并缓存
const qr1 = getCachedQRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg1 = qr1.toSVG(256);

// 第二次调用：从缓存获取（快 10-100 倍）
const qr2 = getCachedQRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);
const svg2 = qr2.toSVG(256);

// qr1 和 qr2 是同一个实例
console.log(qr1 === qr2); // true
```

### clearQRCodeCache

清空 QRCode 缓存。

```typescript
function clearQRCodeCache(): void
```

#### 示例

```typescript
// 浏览器环境
import { clearQRCodeCache, getCachedQRCode } from '@veaba/qrcode-js';
// Node.js 环境
// import { clearQRCodeCache, getCachedQRCode } from '@veaba/qrcode-node';

// 使用缓存
const qr = getCachedQRCode('https://github.com/veaba/qrcodes');

// 清空缓存
clearQRCodeCache();

// 下次调用将重新创建
const qr2 = getCachedQRCode('https://github.com/veaba/qrcodes');
console.log(qr === qr2); // false
```

### getCacheStats

获取缓存统计信息。

```typescript
function getCacheStats(): {
  size: number;
  maxSize: number;
  keys: string[];
}
```

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `size` | `number` | 当前缓存条目数 |
| `maxSize` | `number` | 最大缓存容量（默认 100） |
| `keys` | `string[]` | 所有缓存键 |

#### 示例

```typescript
// 浏览器环境
import { getCacheStats, getCachedQRCode } from '@veaba/qrcode-js';
// Node.js 环境
// import { getCacheStats, getCachedQRCode } from '@veaba/qrcode-node';

// 生成一些 QRCode
getCachedQRCode('https://github.com/veaba/qrcodes/1');
getCachedQRCode('https://github.com/veaba/qrcodes/2');
getCachedQRCode('https://github.com/veaba/qrcodes/3');

// 查看统计
const stats = getCacheStats();
console.log(stats);
// {
//   size: 3,
//   maxSize: 100,
//   keys: ['https://github.com/veaba/qrcodes/1:2', 'https://github.com/veaba/qrcodes/2:2', 'https://github.com/veaba/qrcodes/3:2']
// }
```

### configureCache

配置缓存选项。

```typescript
function configureCache(options: CacheOptions): void
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `maxSize` | `number` | 否 | 最大缓存容量 |
| `enabled` | `boolean` | 否 | 是否启用缓存 |

#### 示例

```typescript
// 浏览器环境
import { configureCache, getCachedQRCode } from '@veaba/qrcode-js';
// Node.js 环境
// import { configureCache, getCachedQRCode } from '@veaba/qrcode-node';

// 增大缓存容量
configureCache({ maxSize: 500 });

// 禁用缓存
configureCache({ enabled: false });

// 此时 getCachedQRCode 总是返回新实例
const qr = getCachedQRCode('https://github.com/veaba/qrcodes');

// 重新启用
configureCache({ enabled: true });
```

## 带缓存的样式函数

所有预设样式函数都有带 `Cached` 后缀的版本：

```typescript
// 浏览器环境
import {
  generateRoundedQRCodeCached,
  generateGradientQRCodeCached,
  generateQRCodeWithLogoAreaCached,
  generateWechatStyleQRCodeCached,
  generateDouyinStyleQRCodeCached,
  generateAlipayStyleQRCodeCached,
  generateCyberpunkStyleQRCodeCached,
  generateRetroStyleQRCodeCached,
  generateMinimalStyleQRCodeCached,
  generateXiaohongshuStyleQRCodeCached
} from '@veaba/qrcode-js';

// Node.js 环境
// import { ... } from '@veaba/qrcode-node';

// 使用缓存版本
const svg1 = generateRoundedQRCodeCached('https://github.com/veaba/qrcodes', 256, 8);
const svg2 = generateRoundedQRCodeCached('https://github.com/veaba/qrcodes', 256, 8); // 从缓存获取
```

## 批量缓存生成

### generateBatchQRCodesCached

```typescript
function generateBatchQRCodesCached(
  texts: string[],
  options: Partial<QRCodeOptions> & { styled?: boolean; style?: StyledSVGOptions } = {}
): string[]
```

#### 示例

```typescript
import { generateBatchQRCodesCached } from '@veaba/qrcode-js';
// Node.js: import { generateBatchQRCodesCached } from '@veaba/qrcode-node';

const texts = ['url1', 'url2', 'url3', 'url1', 'url2']; // 有重复

const svgs = generateBatchQRCodesCached(texts, {
  size: 256,
  styled: true,
  style: { borderRadius: 8 }
});

// 'url1' 和 'url2' 的第二次生成会从缓存获取
```

## LRUCache 类

底层 LRU 缓存实现，可用于自定义缓存场景。

### 构造函数

```typescript
constructor(options: CacheOptions = {})
```

### 方法

#### get

```typescript
get(key: K): V | undefined
```

获取值，如果存在则移动到最近使用位置。

#### set

```typescript
set(key: K, value: V): void
```

设置值，如果已满则淘汰最久未使用的。

#### clear

```typescript
clear(): void
```

清空缓存。

### 属性

#### size

```typescript
get size(): number
```

当前缓存条目数。

#### keys

```typescript
get keys(): K[]
```

所有缓存键。

### 示例

```typescript
// 浏览器环境
import { LRUCache } from '@veaba/qrcode-js';
// Node.js 环境
// import { LRUCache } from '@veaba/qrcode-node';

// 创建缓存
const cache = new LRUCache<string, any>({ maxSize: 50 });

// 设置值
cache.set('key1', { data: 'value1' });
cache.set('key2', { data: 'value2' });

// 获取值
const value = cache.get('key1');
// 'key1' 被移动到最近使用位置

// 查看统计
console.log(cache.size);  // 2
console.log(cache.keys);  // ['key2', 'key1']

// 清空
cache.clear();
```

## 实现细节

### LRU 算法

```
缓存访问流程：

1. get(key)
   ├── 不存在 → return undefined
   └── 存在
       ├── delete(key)      // 从原位置移除
       ├── set(key, value)   // 插入到末尾（最新）
       └── return value

2. set(key, value)
   ├── 已存在
   │   └── delete(key)
   ├── 容量已满
   │   └── delete(firstKey) // 删除第一个（最旧）
   └── set(key, value)      // 插入到末尾
```

### 内存管理

- 缓存的 `QRCodeCore` 实例会被 JavaScript 垃圾回收器管理
- 当缓存被淘汰且没有外部引用时，内存会被释放
- 建议根据实际场景调整 `maxSize`，避免内存占用过大

## 使用场景

### 场景 1：电商商品二维码

```typescript
// 浏览器环境
import { getCachedQRCode } from '@veaba/qrcode-js';
// Node.js 环境
// import { getCachedQRCode } from '@veaba/qrcode-node';

// 热门商品会被缓存，重复访问直接返回
function getProductQRCode(productId: string) {
  return getCachedQRCode(`https://shop.com/p/${productId}`);
}

// 用户频繁访问的商品
const qr1 = getProductQRCode('123'); // 创建
const qr2 = getProductQRCode('123'); // 缓存命中
const qr3 = getProductQRCode('123'); // 缓存命中
```

### 场景 2：活动门票批量生成

```typescript
import { generateBatchQRCodesCached } from '@veaba/qrcode-js';
// Node.js: import { generateBatchQRCodesCached } from '@veaba/qrcode-node';

// 批量生成门票，相同 URL 会复用
const tickets = [
  { id: 'T1', url: 'https://event.com/ticket/1' },
  { id: 'T2', url: 'https://event.com/ticket/2' },
  { id: 'T3', url: 'https://event.com/ticket/1' }, // 重复
];

const svgs = generateBatchQRCodesCached(
  tickets.map(t => t.url),
  { size: 256 }
);
// T1 和 T3 的 QRCode 相同，T3 从缓存获取
```

### 场景 3：动态调整缓存

```typescript
// 浏览器环境
import { configureCache, getCacheStats } from '@veaba/qrcode-js';
// Node.js 环境
// import { configureCache, getCacheStats } from '@veaba/qrcode-node';

// 高峰期增大缓存
function onHighTraffic() {
  configureCache({ maxSize: 500 });
}

// 低峰期减小缓存
function onLowTraffic() {
  configureCache({ maxSize: 50 });
  // 自动淘汰多余的缓存条目
}

// 监控缓存命中率
function logCacheStats() {
  const stats = getCacheStats();
  console.log(`Cache: ${stats.size}/${stats.maxSize}`);
}
```

## 性能对比

| 场景 | 无缓存 | 有缓存 | 提升 |
|------|-------|-------|------|
| 重复文本 | 100 μs | 1 μs | 100x |
| 50% 命中 | 100 μs | 50 μs | 2x |
| 90% 命中 | 100 μs | 10 μs | 10x |
| 首次生成 | 100 μs | 100 μs | 1x |

## 最佳实践

1. **默认使用缓存**：对于可能重复的文本，优先使用 `getCachedQRCode`
2. **合理设置容量**：根据内存和访问模式调整 `maxSize`
3. **监控缓存状态**：使用 `getCacheStats` 了解缓存效果
4. **适时清空**：长时间运行后，可定期清空缓存释放内存
