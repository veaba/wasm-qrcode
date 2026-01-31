# API 统一完成总结

## 变更概述

所有前端 QRCode 包现在统一使用 `@veaba/qrcode-shared` 作为核心依赖，API 完全一致。

## 包结构

```
packages/
├── shared/                    # 核心库 (所有功能)
│   └── src/index.ts           # 统一导出所有 API
├── qrcodejs/                  # 浏览器兼容包 (带缓存)
│   └── src/index.js           # 重新导出 @veaba/qrcode-shared
├── qrcodejs-cache/            # 缓存版本
│   └── src/index.js           # 重新导出 @veaba/qrcode-shared (默认使用缓存版本)
├── qrcodejs-perf/             # 性能版本 (无缓存)
│   └── src/index.js           # 重新导出 @veaba/qrcode-shared (默认使用非缓存版本)
└── qrcode-wasm/               # WebAssembly 版本
    └── pkg/                   # wasm-pack 生成 (API 略有不同)
```

## 统一的 API

### 核心类

```typescript
import { QRCodeCore, QRCode } from '@veaba/qrcodejs';
// 或
import { QRCodeCore, QRCode } from '@veaba/qrcodejs-cache';
// 或
import { QRCodeCore, QRCode } from '@veaba/qrcodejs-perf';

const qr = new QRCode('Hello World');
// 或
const qr = new QRCodeCore('Hello World');
```

### 样式生成函数

```typescript
// camelCase (推荐)
import { 
  generateRoundedQRCode,
  generateGradientQRCode,
  generateWechatStyleQRCode,
  // ... 等等
} from '@veaba/qrcodejs';

// snake_case (向后兼容)
import { 
  generate_rounded_qrcode,
  generate_gradient_qrcode,
  generate_wechat_style_qrcode,
  // ... 等等
} from '@veaba/qrcodejs';
```

### 带缓存的版本

```typescript
import { 
  generateRoundedQRCodeCached,
  generateGradientQRCodeCached,
  // ... 等等
} from '@veaba/qrcodejs';
```

### 缓存管理

```typescript
import { 
  getCachedQRCode,
  clearQRCodeCache,
  getCacheStats,
  configureCache
} from '@veaba/qrcodejs';

// 获取缓存的 QRCode
const qr = getCachedQRCode('Hello', QRErrorCorrectLevel.H);

// 查看缓存统计
const stats = getCacheStats();
console.log(stats.size, stats.maxSize);

// 清除缓存
clearQRCodeCache();

// 配置缓存
configureCache({ maxSize: 200, enabled: true });
```

### 异步生成

```typescript
import { generateQRCodeAsync, generateBatchAsync } from '@veaba/qrcodejs';

// 单个异步生成
const result = await generateQRCodeAsync('Hello', {
  size: 256,
  styled: true,
  style: { borderRadius: 8 },
  cache: true  // 是否使用缓存
});
console.log(result.svg, result.moduleCount);

// 批量异步生成
const results = await generateBatchAsync(['text1', 'text2'], {
  styled: true
});
```

## 各包差异

| 功能 | qrcodejs | qrcodejs-cache | qrcodejs-perf |
|------|----------|----------------|---------------|
| 默认缓存 | 可选 | 是 | 否 |
| 样式函数 | 缓存/非缓存 | 缓存 | 非缓存 |
| 批量生成 | 缓存/非缓存 | 缓存 | 非缓存 |
| 适用场景 | 通用 | 重复生成相同内容 | 每次生成不同内容 |

## 使用建议

### 1. 通用场景 - 使用 `@veaba/qrcodejs`

```bash
npm install @veaba/qrcodejs
```

```javascript
import { generateRoundedQRCodeCached, clearQRCodeCache } from '@veaba/qrcodejs';

// 使用缓存版本
const svg = generateRoundedQRCodeCached('Hello', 256, 8);

// 或根据需要选择
import { generateRoundedQRCode } from '@veaba/qrcodejs'; // 非缓存版本
```

### 2. 需要缓存 - 使用 `@veaba/qrcodejs-cache`

```bash
npm install @veaba/qrcodejs-cache
```

```javascript
import { generateRoundedQRCode } from '@veaba/qrcodejs-cache';
// 默认使用缓存
const svg = generateRoundedQRCode('Hello', 256, 8);
```

### 3. 追求性能 - 使用 `@veaba/qrcodejs-perf`

```bash
npm install @veaba/qrcodejs-perf
```

```javascript
import { generateRoundedQRCode } from '@veaba/qrcodejs-perf';
// 默认不使用缓存，每次都生成新的实例
const svg = generateRoundedQRCode('Hello', 256, 8);
```

### 4. 最高性能 - 使用 `@veaba/qrcode-wasm`

```bash
npm install @veaba/qrcode-wasm
```

```javascript
import init, { generate_rounded_qrcode } from '@veaba/qrcode-wasm';

await init();
const svg = generate_rounded_qrcode('Hello', 256, 8);
```

## 向后兼容

所有包都保留了 snake_case 的命名方式，现有的代码无需修改即可继续使用：

```javascript
// 旧代码仍然有效
import { generate_rounded_qrcode } from '@veaba/qrcodejs';
const svg = generate_rounded_qrcode('Hello', 256, 8);
```

## 代码复用统计

| 包名 | 重构前代码量 | 重构后代码量 | 复用率 |
|------|-------------|-------------|--------|
| @veaba/qrcodejs | ~1500 行 | ~50 行 | 97% |
| @veaba/qrcodejs-cache | ~800 行 | ~50 行 | 94% |
| @veaba/qrcodejs-perf | ~600 行 | ~30 行 | 95% |
| @veaba/qrcode-shared | - | ~900 行 | - |

## 维护优势

1. **单一 truth source**: 所有核心逻辑在 `@veaba/qrcode-shared` 中维护
2. **减少重复代码**: 消除了 3 个包之间的代码重复
3. **统一更新**: 修复 bug 或添加功能只需修改一个地方
4. **类型安全**: TypeScript 类型定义统一在 shared 中
5. **测试简化**: 只需测试核心库，各包装器只需测试导出
