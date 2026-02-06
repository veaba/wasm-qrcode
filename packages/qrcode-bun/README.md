# @veaba/qrcode-bun

QRCode 生成器的纯 TypeScript 实现，专为 Bun 运行时优化。

## 特性

- 🚀 **纯 TypeScript** - 无需编译，Bun 直接运行
- 📦 **零构建步骤** - 发布源码，类型即代码
- 🔷 **完整类型** - 开箱即用的类型支持
- ⚡ **Bun 优化** - 针对 Bun 运行时性能优化
- 🎨 **多样式支持** - 内置微信、抖音、支付宝等风格

## 要求

- Bun >= 1.0.0

## 安装

```bash
bun add @veaba/qrcode-bun
```

## 快速开始

```typescript
import { QRCode } from '@veaba/qrcode-bun';

const qr = new QRCode('https://example.com');
const svg = qr.toSVG();
console.log(svg);
```

## API 文档

### QRCode 类

#### 构造函数

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-bun';

// 默认使用 H 级纠错
const qr = new QRCode('https://example.com');

// 指定纠错级别
const qr2 = new QRCode('https://example.com', QRErrorCorrectLevel.H);
```

**纠错级别：**
- `QRErrorCorrectLevel.L` (低) - 约 7% 容错
- `QRErrorCorrectLevel.M` (中) - 约 15% 容错
- `QRErrorCorrectLevel.Q` (较高) - 约 25% 容错
- `QRErrorCorrectLevel.H` (高) - 约 30% 容错

#### 方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `toSVG(size?: number)` | `string` | 生成 SVG 字符串 |
| `toStyledSVG(options)` | `string` | 生成样式化 SVG |
| `getModulesJSON()` | `string` | 获取模块数据 JSON |
| `getModuleCount()` | `number` | 获取模块数量 |
| `saveToFile(filepath, size?)` | `Promise<void>` | 保存 SVG 到文件 (Bun 特有) |
| `savePNGToFile(filepath, size?)` | `Promise<void>` | 保存 PNG 到文件 (Bun 特有) |

#### 样式化 SVG 选项

```typescript
import { QRCode, StyledSVGOptions } from '@veaba/qrcode-bun';

const qr = new QRCode('https://example.com');

// 圆角风格
const svg1 = qr.toStyledSVG({
  borderRadius: 8,
  quietZone: 2
});

// 渐变风格
const svg2 = qr.toStyledSVG({
  gradient: { color1: '#667eea', color2: '#764ba2' }
});

// 自定义颜色
const svg3 = qr.toStyledSVG({
  colorDark: '#07C160',
  colorLight: '#ffffff',
  margin: 4
});
```

### 快捷函数

#### 预设风格

```typescript
import {
  generateWechatStyleQRCode,    // 微信绿风格
  generateDouyinStyleQRCode,    // 抖音黑红风格
  generateAlipayStyleQRCode,    // 支付宝蓝风格
  generateXiaohongshuStyleQRCode, // 小红书红风格
  generateCyberpunkStyleQRCode, // 赛博朋克风格
  generateRetroStyleQRCode,     // 复古风格
  generateMinimalStyleQRCode,   // 极简风格
  generateGradientQRCode,       // 渐变风格
  generateRoundedQRCode         // 圆角风格
} from '@veaba/qrcode-bun';

// 使用预设风格
const svg = generateWechatStyleQRCode('https://example.com', 256);
```

#### 批量生成

```typescript
import { generateBatchQRCodes, generateBatchAsync } from '@veaba/qrcode-bun';

// 同步批量生成
const texts = ['url1', 'url2', 'url3'];
const svgs = generateBatchQRCodes(texts);

// 异步批量生成
const svgs2 = await generateBatchAsync(texts);
```

#### 异步生成

```typescript
import { generateQRCodeAsync } from '@veaba/qrcode-bun';

const svg = await generateQRCodeAsync('https://example.com');
```

### 文件保存 (Bun 特有)

```typescript
import { QRCode } from '@veaba/qrcode-bun';

const qr = new QRCode('https://example.com');

// 保存 SVG
await qr.saveToFile('./qrcode.svg');

// 保存 PNG
await qr.savePNGToFile('./qrcode.png', 512);
```

## 开发

```bash
# 进入目录
cd packages/qrcode-bun

# 安装依赖
bun install

# 类型检查
bun run typecheck

# 测试
bun test
```

## 纯 TypeScript 发布

本包采用**纯 TypeScript 发布**方案，直接发布源码，Bun 运行时直接执行 `.ts` 文件。

### 发布配置

```json
{
  "main": "src/index.ts",
  "module": "src/index.ts",
  "types": "src/index.ts",
  "files": ["src"]
}
```

### 优势

- ✅ **类型与源码完全同步** - 无需维护 `.d.ts` 文件
- ✅ **无 source map 问题** - 直接调试源码
- ✅ **更快的发布流程** - 无需构建步骤
- ✅ **更小的包体积** - 无重复文件 (JS + d.ts)
- ✅ **更好的开发体验** - 跳转到源码而非编译后代码

### 使用要求

- 安装环境必须支持 Bun（或其他能直接运行 TS 的运行时）

## 性能

针对 Bun 运行时优化：
- 使用 `TextEncoder` 单例避免重复创建
- 使用 `Uint8Array` 优化二进制操作
- 使用 Bun 原生文件 API 保存文件

## License

MIT
