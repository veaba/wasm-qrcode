# @veaba/qrcode-ts

Bun 运行时的 QRCode 生成库，针对 Bun 的高性能特性进行优化，适合边缘计算和快速启动场景。

## 安装

```bash
bun add @veaba/qrcode-ts
```

## 为什么选择 Bun？

Bun 相比 Node.js 的优势：

| 特性 | Bun | Node.js |
|------|-----|---------|
| 启动时间 | 快 3-4 倍 | 较慢 |
| 单条生成性能 | ~15,000 ops/s | ~10,000 ops/s |
| 批量生成性能 | ~17,000 ops/s | ~6,000 ops/s |
| TypeScript | 原生支持 | 需转译 |
| 包管理 | 内置，更快 | npm/yarn/pnpm |

## 基础使用

### 创建 QRCode

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

// 创建 QRCode 实例
const qr = new QRCode('https://github.com/veaba/wasm-qrcode', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG();
console.log(svg);
```

### 保存文件

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

const qr = new QRCode('https://example.com', QRErrorCorrectLevel.H);

// Bun 的文件写入 API
await Bun.write('qrcode.svg', qr.toSVG());

// 或者使用 Node.js 兼容 API
import fs from 'fs';
fs.writeFileSync('qrcode.svg', qr.toSVG());
```

## Bun 原生 API

### 使用 Bun.serve

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === '/qrcode') {
      const text = url.searchParams.get('text') || 'https://example.com';
      const size = parseInt(url.searchParams.get('size') || '256');
      
      const qr = new QRCode(text, QRErrorCorrectLevel.H);
      const svg = qr.toStyledSVG({ size, borderRadius: 8 });
      
      return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
});

console.log('Server running on http://localhost:3000');
console.log('Try: http://localhost:3000/qrcode?text=Hello&size=256');
```

### 高性能批量生成

Bun 的并发性能特别适合批量生成：

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

// 生成 10000 个 QRCode
const texts = Array.from({ length: 10000 }, (_, i) => `https://example.com/${i}`);

console.time('generate');

// Bun 的 Array.map 性能优异
const qrcodes = texts.map(text => {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.toSVG(256);
});

console.timeEnd('generate');
// 通常在 600ms 左右完成 10000 条

console.log(`Generated ${qrcodes.length} QR codes`);
```

### 使用 Worker

Bun 支持 Web Workers，可以并行生成：

```typescript
// worker.ts
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

self.onmessage = (event) => {
  const { id, text, size } = event.data;
  
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  const svg = qr.toSVG(size);
  
  self.postMessage({ id, svg });
};

// main.ts
const workers: Worker[] = [];
const numWorkers = navigator.hardwareConcurrency || 4;

for (let i = 0; i < numWorkers; i++) {
  workers.push(new Worker('./worker.ts'));
}

async function generateWithWorkers(texts: string[], size: number = 256) {
  const results: string[] = new Array(texts.length);
  let index = 0;
  
  return new Promise<string[]>((resolve) => {
    let completed = 0;
    
    for (const worker of workers) {
      worker.onmessage = (event) => {
        const { id, svg } = event.data;
        results[id] = svg;
        completed++;
        
        if (completed === texts.length) {
          resolve(results);
        } else if (index < texts.length) {
          worker.postMessage({ id: index, text: texts[index], size });
          index++;
        }
      };
      
      // 启动第一个任务
      if (index < texts.length) {
        worker.postMessage({ id: index, text: texts[index], size });
        index++;
      }
    }
  });
}

// 使用
const texts = Array.from({ length: 1000 }, (_, i) => `https://example.com/${i}`);
const results = await generateWithWorkers(texts, 256);
```

## 边缘计算部署

### Cloudflare Workers（使用 Bun 构建）

```typescript
// index.ts
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const text = url.searchParams.get('text') || 'https://example.com';
    const size = parseInt(url.searchParams.get('size') || '256');
    
    const qr = new QRCode(text, QRErrorCorrectLevel.H);
    const svg = qr.toSVG(size);
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
};
```

### Vercel Edge Function

```typescript
// api/qrcode.ts
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { text = 'https://example.com', size = '256' } = req.query;
  
  const qr = new QRCode(text as string, QRErrorCorrectLevel.H);
  const svg = qr.toSVG(parseInt(size as string));
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(svg);
}

export const config = {
  runtime: 'edge'
};
```

## 与 Node.js API 的对比

### 文件写入

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

const qr = new QRCode('https://example.com', QRErrorCorrectLevel.H);

// Bun 原生 API（推荐）
await Bun.write('qrcode.svg', qr.toSVG());

// 也兼容 Node.js API
import fs from 'fs';
fs.writeFileSync('qrcode.svg', qr.toSVG());
```

### HTTP 服务器

```typescript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';

// Bun 原生（推荐）
Bun.serve({
  port: 3000,
  fetch(req) {
    // ...
  }
});

// 也兼容 Node.js http
import http from 'http';
http.createServer((req, res) => {
  // ...
}).listen(3000);
```

## 性能测试

运行基准测试：

```bash
cd packages/qrcode-ts
bun benchmark/index.ts
```

预期输出：

```
============================================================
📦 @veaba/qrcode-ts
📝 Bun QRCode 生成性能测试
============================================================

单条生成 (short):
  ⚡ 15,262 ops/s
  ⏱️  0.0655 ms/op

批量生成 (1000 条):
  ⚡ 17,000 ops/s
  ⏱️  60.5701 ms/op

TextEncoder 编码:
  ⚡ 5,621,451 ops/s
```

## 与 @veaba/qrcode-node 的区别

两个包 API 完全一致，可以无缝切换：

```typescript
// Node.js
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-node';

// Bun
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcode-ts';
```

主要区别：

| 特性 | @veaba/qrcode-ts | @veaba/qrcode-node |
|------|-----------------|-------------------|
| 运行时 | Bun | Node.js |
| 启动速度 | 更快 | 快 |
| 批量性能 | 更优 | 优 |
| TypeScript | 原生 | 需 ts-node/tsx |
| npm 兼容 | 是 | 是 |

## 何时使用 @veaba/qrcode-ts？

- ✅ 使用 Bun 作为运行时
- ✅ 需要极致的批量生成性能
- ✅ 边缘计算部署（Cloudflare Workers、Vercel Edge）
- ✅ 快速启动的 CLI 工具
- ✅ 原生 TypeScript 支持很重要

## 迁移指南

从 Node.js 迁移到 Bun：

1. 替换包名：
```diff
- import { QRCode } from '@veaba/qrcode-node';
+ import { QRCode } from '@veaba/qrcode-ts';
```

2. 文件写入（可选优化）：
```diff
- fs.writeFileSync('file.svg', svg);
+ await Bun.write('file.svg', svg);
```

3. 服务器（可选优化）：
```diff
- app.listen(3000);
+ Bun.serve({ port: 3000, fetch: handler });
```

API 完全兼容，无需修改业务逻辑！
