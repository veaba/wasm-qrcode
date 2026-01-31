# API 一致性对比报告

## 子包概览

| 包名 | 类型 | 依赖 |
|------|------|------|
| @veaba/qrcodejs | JavaScript (缓存版) | @veaba/shared |
| @veaba/qrcodejs-cache | JavaScript (缓存版) | @veaba/shared |
| @veaba/qrcodejs-perf | JavaScript (无缓存版) | @veaba/shared |
| @veaba/qrcode-wasm | WebAssembly | wasm-pack 生成 |

## API 对比矩阵

### 1. 核心类

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| QRCode | ✅ (QRCodeCore 别名) | ✅ (包装器) | ✅ (包装器) | ❌ QRCodeWasm | ⚠️ 不一致 |
| QRCodeCore | ✅ | ✅ _core | ✅ _core | ❌ | ⚠️ 不一致 |
| QRCodeGenerator | ❌ | ❌ | ❌ | ✅ | ⚠️ WASM 特有 |
| QRCodeWasm | ❌ | ❌ | ❌ | ✅ | ⚠️ WASM 特有 |
| StyledQRCode | ❌ | ❌ | ❌ | ✅ | ⚠️ WASM 特有 |
| CanvasRenderer | ❌ | ❌ | ❌ | ✅ | ⚠️ WASM 特有 |

### 2. 枚举/常量

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| QRErrorCorrectLevel | ✅ | ✅ | ✅ | ✅ CorrectLevel | ✅ 一致 |
| QRMode | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| PATTERN_POSITION_TABLE | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| QRCodeLimitLength | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| RS_BLOCK_TABLE | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |

### 3. 样式生成函数 (snake_case)

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| generate_rounded_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_qrcode_with_logo_area | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_gradient_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_wechat_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_douyin_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_alipay_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_xiaohongshu_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_cyberpunk_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_retro_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |
| generate_minimal_style_qrcode | ✅ (Cached) | ✅ (Cached) | ✅ | ✅ | ✅ 一致 |

### 4. 样式生成函数 (camelCase)

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| generateRoundedQRCode | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |
| generateQRCodeWithLogoArea | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |
| generateGradientQRCode | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |
| ... | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |
| generateRoundedQRCodeCached | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |
| ... | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |

### 5. 缓存相关函数

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| getCachedQRCode | ✅ | ❌ | ❌ | ❌ | ⚠️ 不一致 |
| clearQRCodeCache | ✅ | ✅ | ❌ | ❌ | ⚠️ 不一致 |
| getCacheStats | ✅ | ✅ | ❌ | ❌ | ⚠️ 不一致 |

### 6. 批量/异步生成函数

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| generateBatchQRCodes | ✅ | ✅ | ✅ | ❌ generate_qrcode_batch | ⚠️ 命名不一致 |
| generateQRCodeAsync | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| generateBatchAsync | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| generateBatchQRCodesCached | ✅ | ❌ | ❌ | ❌ | ⚠️ 仅 qrcodejs |

### 7. WASM 特有函数

| API | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|-----|----------|----------------|---------------|-------------|------|
| generate_qrcode | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| generate_qrcode_fast | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| render_qrcode_to_pixels | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| render_qrcode_batch_pixels | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| init_thread_pool | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| is_parallel_supported | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| version | ✅ | ❌ | ❌ | ✅ | ⚠️ 不一致 |
| get_version_info | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| greet | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| start | ❌ | ❌ | ❌ | ✅ | WASM 特有 |

### 8. QRCode 类方法

| 方法 | qrcodejs | qrcodejs-cache | qrcodejs-perf | qrcode-wasm | 状态 |
|------|----------|----------------|---------------|-------------|------|
| isDark(row, col) | ✅ | ✅ | ✅ | ✅ | ✅ 一致 |
| getModuleCount() | ✅ | ✅ get_module_count | ✅ get_module_count | ✅ get_module_count | ⚠️ 命名不一致 |
| toSVG(size) | ✅ | ✅ | ✅ | ❌ | ⚠️ WASM 缺失 |
| toStyledSVG(options) | ✅ | ✅ get_styled_svg | ✅ get_styled_svg | ❌ | ⚠️ 命名不一致 |
| get_svg() | ✅ | ✅ | ✅ | ✅ | ✅ 一致 |
| get_module_count() | ❌ | ✅ | ✅ | ✅ | ⚠️ 仅 JS |
| get_styled_svg(options) | ❌ | ✅ | ✅ | ❌ | ⚠️ 仅 JS |
| make_code(text) | ❌ | ❌ | ❌ | ✅ | WASM 特有 |
| get_modules_json() | ❌ | ❌ | ❌ | ✅ | WASM 特有 |

## 不一致项汇总

### 严重不一致 (需要修复)

1. **QRCode 类命名**
   - JS 包: `QRCode` (包装器) / `QRCodeCore` (核心)
   - WASM: `QRCodeWasm`
   - 建议: JS 包统一导出 `QRCode` 作为 `QRCodeCore` 的别名

2. **方法命名风格**
   - JS: `getModuleCount()` / `toStyledSVG()` (camelCase)
   - WASM: `get_module_count()` / `get_styled_svg()` (snake_case)
   - 建议: JS 包同时提供两种命名风格

3. **缓存函数位置**
   - `getCachedQRCode`, `clearQRCodeCache`, `getCacheStats` 只在 qrcodejs
   - 建议: 移到 @veaba/shared，所有包统一使用

4. **批量生成函数命名**
   - JS: `generateBatchQRCodes`
   - WASM: `generate_qrcode_batch`
   - 建议: WASM 包添加 camelCase 别名

### 中等不一致 (建议修复)

5. **WASM 特有功能未在 JS 中实现**
   - `render_qrcode_to_pixels` - 渲染到像素数组
   - `init_thread_pool` - 线程池初始化
   - 建议: JS 包提供空实现或模拟实现

6. **版本信息函数**
   - WASM: `version()`, `get_version_info()`
   - JS: 缺失
   - 建议: JS 包添加统一版本信息

### 轻微不一致 (可选修复)

7. **枚举导出**
   - JS: `QRMode`, `PATTERN_POSITION_TABLE` 等
   - WASM: 未导出
   - 建议: WASM 不需要这些内部常量

## 建议的统一 API

### 核心类 (所有包)

```typescript
class QRCode {
  constructor(text: string, correctLevel?: QRErrorCorrectLevel);
  
  // 属性
  readonly text: string;
  readonly correctLevel: QRErrorCorrectLevel;
  readonly typeNumber: number;
  readonly moduleCount: number;
  
  // 方法 (camelCase 为主)
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
  toSVG(size?: number): string;
  toStyledSVG(options?: StyledSVGOptions): string;
  
  // 别名 (snake_case，向后兼容)
  get_module_count(): number;
  get_svg(): string;
  get_styled_svg(options?: StyledSVGOptions): string;
}
```

### 样式生成函数 (所有包)

```typescript
// camelCase
function generateRoundedQRCode(text: string, size?: number, radius?: number): string;
function generateQRCodeWithLogoArea(text: string, size?: number, logoRatio?: number): string;
// ... 其他样式函数

// snake_case 别名
function generate_rounded_qrcode(text: string, size?: number, radius?: number): string;
function generate_qrcode_with_logo_area(text: string, size?: number, logoRatio?: number): string;
// ... 其他样式函数
```

### 缓存相关 (qrcodejs, qrcodejs-cache)

```typescript
function getCachedQRCode(text: string, correctLevel: QRErrorCorrectLevel): QRCode;
function clearQRCodeCache(): void;
function getCacheStats(): { size: number; maxSize: number; keys: string[] };
```

### 批量/异步生成 (所有 JS 包)

```typescript
function generateBatchQRCodes(texts: string[], options?: BatchOptions): string[];
function generateQRCodeAsync(text: string, options?: AsyncOptions): Promise<QRCodeResult>;
function generateBatchAsync(texts: string[], options?: AsyncOptions): Promise<QRCodeResult[]>;
```

### WASM 特有 (仅 qrcode-wasm)

```typescript
// Canvas 渲染
function renderQRCodeToPixels(text: string, width: number, height: number): Uint8Array;
function renderQRCodeBatchPixels(texts: string[], width: number, height: number): Uint8Array[];

// 并行计算
function initThreadPool(numThreads: number): void;
function isParallelSupported(): boolean;
```
