# 后端 QRCode 包统一 API 规范

## 概述

本文档定义了三个后端 QRCode 包的统一 API 接口，确保 `@veaba/qrcode-node`、`@veaba/qrcode-ts` 和 `@veaba/qrcode-rust` 提供一致的调用方式。

## 包列表

| 包名 | 运行时 | 特点 |
|------|--------|------|
| `@veaba/qrcode-node` | Node.js | 支持 PNG Buffer 生成 |
| `@veaba/qrcode-ts` | Bun | 支持文件直接写入 |
| `@veaba/qrcode-rust` | WASM/Native | 高性能 Rust 实现 |

## 统一 API 接口

### 常量

```typescript
// 错误纠正级别
enum QRErrorCorrectLevel {
  L = 1,  // 低 (~7%)
  M = 0,  // 中 (~15%)
  Q = 3,  // 较高 (~25%)
  H = 2   // 高 (~30%)
}

// QRCode 模式
const QRMode = {
  MODE_8BIT_BYTE: 4
};
```

### QRCode 类

```typescript
class QRCode {
  // 构造函数
  constructor(text: string, correctLevel?: QRErrorCorrectLevel);

  // 属性（只读）
  readonly text: string;
  readonly correctLevel: QRErrorCorrectLevel;
  readonly typeNumber: number;
  readonly moduleCount: number;

  // 方法
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
  toSVG(size?: number): string;
  toStyledSVG(options?: StyledSVGOptions): string;
}
```

### 样式生成函数

```typescript
// 基础样式
function generateRoundedQRCode(text: string, size?: number, radius?: number): string;
function generateQRCodeWithLogoArea(text: string, size?: number, logoRatio?: number): string;
function generateGradientQRCode(text: string, size?: number, color1?: string, color2?: string): string;

// 平台风格
function generateWechatStyleQRCode(text: string, size?: number): string;
function generateDouyinStyleQRCode(text: string, size?: number): string;
function generateAlipayStyleQRCode(text: string, size?: number): string;
function generateXiaohongshuStyleQRCode(text: string, size?: number): string;
function generateCyberpunkStyleQRCode(text: string, size?: number): string;
function generateRetroStyleQRCode(text: string, size?: number): string;
function generateMinimalStyleQRCode(text: string, size?: number): string;
```

### 批量/异步生成

```typescript
function generateBatchQRCodes(texts: string[], options?: Partial<QRCodeOptions>): string[];
function generateQRCodeAsync(text: string, options?: Partial<QRCodeOptions>): Promise<string>;
function generateBatchAsync(texts: string[], options?: Partial<QRCodeOptions>): Promise<string[]>;
```

## 类型定义

```typescript
interface QRCodeOptions {
  text: string;
  correctLevel?: QRErrorCorrectLevel;
  size?: number;
  colorDark?: string;
  colorLight?: string;
}

interface StyledSVGOptions {
  size?: number;
  colorDark?: string;
  colorLight?: string;
  borderRadius?: number;
  gradient?: { color1: string; color2: string } | null;
  quietZone?: number;
  logoRegions?: Array<{ row: number; col: number; size: number }>;
}

interface QRCodeResult {
  text: string;
  svg: string;
  moduleCount: number;
}
```

## 平台特定扩展

### Node.js 特有 (@veaba/qrcode-node)

```typescript
class QRCode {
  // 生成 PNG Buffer (BMP 格式)
  toPNGBuffer(size?: number): Buffer;
}
```

### Bun 特有 (@veaba/qrcode-ts)

```typescript
class QRCode {
  // 保存到文件
  saveToFile(filepath: string, size?: number): Promise<void>;
  savePNGToFile(filepath: string, size?: number): Promise<void>;
  getModulesJSON(): string;
}
```

### Rust/WASM 特有 (@veaba/qrcode-rust)

```rust
// WASM 导出结构
pub struct QRCodeWasm {
    pub fn new(text: &str, correct_level: CorrectLevel) -> Self;
    pub fn text(&self) -> String;
    pub fn correct_level(&self) -> i32;
    pub fn type_number(&self) -> i32;
    pub fn module_count(&self) -> i32;
    pub fn get_module_count(&self) -> i32;
    pub fn is_dark(&self, row: i32, col: i32) -> bool;
    pub fn to_svg(&self, size: Option<i32>) -> String;
    pub fn to_styled_svg(&self, options: JsValue) -> String;
    pub fn get_modules_json(&self) -> String;
}
```

## 使用示例

### 基础用法（三平台通用）

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node'; // 或 qrcode-ts, qrcode-rust

// 创建 QRCode
const qr = new QRCode('Hello World', QRErrorCorrectLevel.H);

// 生成 SVG
const svg = qr.toSVG(256);

// 生成带样式的 SVG
const styledSvg = qr.toStyledSVG({
  size: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  borderRadius: 8,
  quietZone: 2
});
```

### 样式生成（三平台通用）

```typescript
import { generateWechatStyleQRCode, generateGradientQRCode } from '@veaba/qrcode-node';

// 微信风格
const svg1 = generateWechatStyleQRCode('Hello');

// 渐变风格
const svg2 = generateGradientQRCode('Hello', 256, '#667eea', '#764ba2');
```

### 批量生成（三平台通用）

```typescript
import { generateBatchQRCodes, generateBatchAsync } from '@veaba/qrcode-node';

// 同步批量生成
const svgs = generateBatchQRCodes(['text1', 'text2', 'text3']);

// 异步批量生成
const svgsAsync = await generateBatchAsync(['text1', 'text2', 'text3']);
```

### 平台特定用法

**Node.js:**
```typescript
import { QRCode } from '@veaba/qrcode-node';
import { writeFileSync } from 'fs';

const qr = new QRCode('Hello');
const pngBuffer = qr.toPNGBuffer(256);
writeFileSync('qrcode.bmp', pngBuffer);
```

**Bun:**
```typescript
import { QRCode } from '@veaba/qrcode-ts';

const qr = new QRCode('Hello');
await qr.saveToFile('qrcode.svg', 256);
await qr.savePNGToFile('qrcode.bmp', 256);
```

**Rust/WASM:**
```javascript
import { QRCodeWasm } from '@veaba/qrcode-rust';

const qr = new QRCodeWasm('Hello', CorrectLevel.H);
const svg = qr.toSVG(256);
const json = qr.getModulesJSON();
```

## 版本兼容性

| API 版本 | qrcode-node | qrcode-ts | qrcode-rust |
|----------|-------------|-----------|-------------|
| 1.0.0    | >= 1.0.0    | >= 1.0.0  | >= 1.0.0    |

## 迁移指南

### 从旧版本迁移

所有包都遵循相同的 API 设计，迁移时只需更改导入路径：

```typescript
// 之前
import { QRCode } from 'qrcodejs-cache';

// 之后 (Node.js)
import { QRCode } from '@veaba/qrcode-node';

// 之后 (Bun)
import { QRCode } from '@veaba/qrcode-ts';

// 之后 (WASM)
import { QRCodeWasm as QRCode } from '@veaba/qrcode-rust';
```
