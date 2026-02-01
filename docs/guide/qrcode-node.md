# @veaba/qrcode-node

Node.js 环境的 QRCode 生成库，支持 SVG 和 PNG 输出，适合服务端渲染和文件生成。

## 安装

```bash
npm install @veaba/qrcode-node
```

## 基础使用

### 创建 QRCode

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

// 创建 QRCode 实例
const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

// 获取 SVG 字符串
const svg = qr.toSVG();
console.log(svg);
```

### 保存为文件

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';
import fs from 'fs';

const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

// 保存 SVG
fs.writeFileSync('qrcode.svg', qr.toSVG());

// 保存 PNG
fs.writeFileSync('qrcode.png', qr.toPNG(256));
```

## 输出格式

### SVG 输出

```typescript
const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

// 基础 SVG（默认 256x256）
const svg = qr.toSVG();

// 指定尺寸
const largeSvg = qr.toSVG(512);
```

### PNG 输出

```typescript
const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

// 生成 PNG Buffer（默认 256x256）
const pngBuffer = qr.toPNG();

// 指定尺寸
const largePng = qr.toPNG(512);

// 保存文件
fs.writeFileSync('qrcode.png', pngBuffer);
```

### 样式化 SVG

```typescript
const qr = new QRCode('https://github.com/veaba/qrcodes', QRErrorCorrectLevel.H);

const styledSvg = qr.toStyledSVG({
  size: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  borderRadius: 8,
  quietZone: 2,
  gradient: {
    color1: '#667eea',
    color2: '#764ba2'
  }
});

fs.writeFileSync('styled-qrcode.svg', styledSvg);
```

## Web 服务集成

### Express 示例

```typescript
import express from 'express';
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

const app = express();

// SVG 端点
app.get('/qrcode.svg', (req, res) => {
  const { text = 'https://github.com/veaba/qrcodes', size = 256 } = req.query;
  
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  const svg = qr.toStyledSVG({ 
    size: parseInt(size),
    borderRadius: 8 
  });
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// PNG 端点
app.get('/qrcode.png', (req, res) => {
  const { text = 'https://github.com/veaba/qrcodes', size = 256 } = req.query;
  
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  const png = qr.toPNG(parseInt(size));
  
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Try: http://localhost:3000/qrcode.svg?text=Hello&size=256');
});
```

### Fastify 示例

```typescript
import Fastify from 'fastify';
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

const fastify = Fastify();

fastify.get('/qrcode', async (request, reply) => {
  const { text = 'https://github.com/veaba/qrcodes', size = 256, type = 'svg' } = request.query;
  
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  
  if (type === 'png') {
    reply.header('Content-Type', 'image/png');
    return qr.toPNG(parseInt(size));
  } else {
    reply.header('Content-Type', 'image/svg+xml');
    return qr.toSVG(parseInt(size));
  }
});

fastify.listen({ port: 3000 });
```

### Next.js API Route

```typescript
// pages/api/qrcode.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text = 'https://github.com/veaba/qrcodes', size = 256 } = req.query;
  
  const qr = new QRCode(text as string, QRErrorCorrectLevel.H);
  const svg = qr.toSVG(parseInt(size as string));
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
}
```

## 批量生成

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';
import fs from 'fs';
import path from 'path';

const urls = [
  'https://github.com/veaba/qrcodes/product/1',
  'https://github.com/veaba/qrcodes/product/2',
  'https://github.com/veaba/qrcodes/product/3'
];

// 批量生成
const outputDir = './qrcodes';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

urls.forEach((url, index) => {
  const qr = new QRCode(url, QRErrorCorrectLevel.H);
  
  // 生成 SVG
  fs.writeFileSync(
    path.join(outputDir, `qrcode-${index + 1}.svg`),
    qr.toSVG(256)
  );
  
  // 生成 PNG
  fs.writeFileSync(
    path.join(outputDir, `qrcode-${index + 1}.png`),
    qr.toPNG(256)
  );
});

console.log(`Generated ${urls.length} QR codes`);
```

## 流式输出

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';
import { createWriteStream } from 'fs';

// 创建可读流
function createQRCodeStream(text: string, size: number) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  const svg = qr.toSVG(size);
  
  return new ReadableStream({
    start(controller) {
      controller.enqueue(Buffer.from(svg));
      controller.close();
    }
  });
}

// 使用
const stream = createQRCodeStream('https://github.com/veaba/qrcodes', 256);
const writeStream = createWriteStream('output.svg');

// Node 18+ 支持 Web Streams
// @ts-ignore
stream.pipeTo(writeStream);
```

## 性能优化

### 使用缓存

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';
import { getCachedQRCode } from '@veaba/qrcode-shared';

// 对于重复文本，使用缓存
function getQRCodeSVG(text: string, size: number = 256): string {
  const qr = getCachedQRCode(text, QRErrorCorrectLevel.H);
  return qr.toSVG(size);
}

// 第一次生成（计算）
const svg1 = getQRCodeSVG('https://github.com/veaba/qrcodes');

// 第二次生成（缓存，快 10-100 倍）
const svg2 = getQRCodeSVG('https://github.com/veaba/qrcodes');
```

### 异步批量生成

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

async function generateBatch(texts: string[], size: number = 256) {
  // 使用 Promise.all 并发生成
  const promises = texts.map(text => {
    return new Promise<{ text: string; svg: string }>((resolve) => {
      const qr = new QRCode(text, QRErrorCorrectLevel.H);
      resolve({ text, svg: qr.toSVG(size) });
    });
  });
  
  return Promise.all(promises);
}

// 使用
const texts = Array.from({ length: 100 }, (_, i) => `https://github.com/veaba/qrcodes/${i}`);
const results = await generateBatch(texts, 256);
```

## 错误处理

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

try {
  // 文本过长会抛出错误
  const longText = 'a'.repeat(1000);
  const qr = new QRCode(longText, QRErrorCorrectLevel.H);
  const svg = qr.toSVG();
} catch (error) {
  console.error('Failed to generate QR code:', error.message);
  // 处理错误，例如返回默认图片或错误信息
}
```

## CLI 工具

可以创建一个简单的 CLI 工具：

```typescript
#!/usr/bin/env node
// qrcode-cli.ts
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';
import fs from 'fs';

const [,, text, output = 'qrcode.png'] = process.argv;

if (!text) {
  console.log('Usage: qrcode-cli <text> [output]');
  process.exit(1);
}

const qr = new QRCode(text, QRErrorCorrectLevel.H);

if (output.endsWith('.svg')) {
  fs.writeFileSync(output, qr.toSVG(256));
} else {
  fs.writeFileSync(output, qr.toPNG(256));
}

console.log(`Generated: ${output}`);
```

## API 参考

### QRCode 类

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `constructor(text, level)` | 构造函数 | `text: string`, `level: QRErrorCorrectLevel` | `QRCode` |
| `toSVG(size?)` | 生成 SVG | `size?: number` | `string` |
| `toPNG(size?)` | 生成 PNG | `size?: number` | `Buffer` |
| `toStyledSVG(options)` | 样式化 SVG | `options: StyledSVGOptions` | `string` |
| `getModuleCount()` | 获取模块数 | - | `number` |
| `isDark(row, col)` | 判断模块颜色 | `row: number`, `col: number` | `boolean` |

### QRErrorCorrectLevel

```typescript
enum QRErrorCorrectLevel {
  L = 1,  // ~7% 容错
  M = 0,  // ~15% 容错
  Q = 3,  // ~25% 容错
  H = 2   // ~30% 容错
}
```

## 与前端包的区别

| 特性 | @veaba/qrcode-node | @veaba/qrcode-wasm |
|------|-------------------|-------------------|
| 环境 | Node.js | 浏览器 |
| PNG 支持 | ✅ 原生 Buffer | ❌ 需额外处理 |
| 文件系统 | ✅ 直接写入 | ❌ 需下载 |
| 服务端渲染 | ✅ 支持 | N/A |
| 性能 | 快（V8 优化）| 更快（WASM）|
