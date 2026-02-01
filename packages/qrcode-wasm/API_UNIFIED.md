# @veaba/qrcode-wasm - Unified API Documentation

This document describes the unified API that matches `@veaba/qrcode-js`.

## Overview

`@veaba/qrcode-wasm` now provides a TypeScript wrapper layer that exposes a CamelCase API consistent with `@veaba/qrcode-js`. The underlying WASM module uses snake_case naming (Rust convention), but the wrapper converts these to CamelCase for JavaScript/TypeScript developers.

## API Comparison

### Core Classes

| Feature | qrcode-js | qrcode-wasm (Unified) | Status |
|---------|-----------|----------------------|--------|
| Core Class | `QRCodeCore` | `QRCodeCore` | ✅ Unified |
| Alias | `QRCode` | `QRCode` | ✅ Unified |

### Enums

| Enum | qrcode-js | qrcode-wasm (Unified) | Status |
|------|-----------|----------------------|--------|
| Error Correction | `QRErrorCorrectLevel` | `QRErrorCorrectLevel` | ✅ Unified |
| Mode | `QRMode` | `QRMode` | ✅ Unified |

### Style Generators (CamelCase)

| Function | qrcode-js | qrcode-wasm (Unified) | Status |
|----------|-----------|----------------------|--------|
| Rounded | `generateRoundedQRCode` | `generateRoundedQRCode` | ✅ Unified |
| Logo Area | `generateQRCodeWithLogoArea` | `generateQRCodeWithLogoArea` | ✅ Unified |
| Gradient | `generateGradientQRCode` | `generateGradientQRCode` | ✅ Unified |
| WeChat | `generateWechatStyleQRCode` | `generateWechatStyleQRCode` | ✅ Unified |
| Douyin | `generateDouyinStyleQRCode` | `generateDouyinStyleQRCode` | ✅ Unified |
| Alipay | `generateAlipayStyleQRCode` | `generateAlipayStyleQRCode` | ✅ Unified |
| Xiaohongshu | `generateXiaohongshuStyleQRCode` | `generateXiaohongshuStyleQRCode` | ✅ Unified |
| Cyberpunk | `generateCyberpunkStyleQRCode` | `generateCyberpunkStyleQRCode` | ✅ Unified |
| Retro | `generateRetroStyleQRCode` | `generateRetroStyleQRCode` | ✅ Unified |
| Minimal | `generateMinimalStyleQRCode` | `generateMinimalStyleQRCode` | ✅ Unified |

### Cached Style Generators

| Function | qrcode-js | qrcode-wasm (Unified) | Status |
|----------|-----------|----------------------|--------|
| Rounded Cached | `generateRoundedQRCodeCached` | `generateRoundedQRCodeCached` | ✅ Unified |
| Logo Area Cached | `generateQRCodeWithLogoAreaCached` | `generateQRCodeWithLogoAreaCached` | ✅ Unified |
| Gradient Cached | `generateGradientQRCodeCached` | `generateGradientQRCodeCached` | ✅ Unified |
| WeChat Cached | `generateWechatStyleQRCodeCached` | `generateWechatStyleQRCodeCached` | ✅ Unified |
| Douyin Cached | `generateDouyinStyleQRCodeCached` | `generateDouyinStyleQRCodeCached` | ✅ Unified |
| Alipay Cached | `generateAlipayStyleQRCodeCached` | `generateAlipayStyleQRCodeCached` | ✅ Unified |
| Xiaohongshu Cached | `generateXiaohongshuStyleQRCodeCached` | `generateXiaohongshuStyleQRCodeCached` | ✅ Unified |
| Cyberpunk Cached | `generateCyberpunkStyleQRCodeCached` | `generateCyberpunkStyleQRCodeCached` | ✅ Unified |
| Retro Cached | `generateRetroStyleQRCodeCached` | `generateRetroStyleQRCodeCached` | ✅ Unified |
| Minimal Cached | `generateMinimalStyleQRCodeCached` | `generateMinimalStyleQRCodeCached` | ✅ Unified |

### Batch/Async Functions

| Function | qrcode-js | qrcode-wasm (Unified) | Status |
|----------|-----------|----------------------|--------|
| Batch | `generateBatchQRCodes` | `generateBatchQRCodes` | ✅ Unified |
| Batch Cached | `generateBatchQRCodesCached` | `generateBatchQRCodesCached` | ✅ Unified |
| Async | `generateQRCodeAsync` | `generateQRCodeAsync` | ✅ Unified |
| Batch Async | `generateBatchAsync` | `generateBatchAsync` | ✅ Unified |

### Cache Management

| Function | qrcode-js | qrcode-wasm (Unified) | Status |
|----------|-----------|----------------------|--------|
| Get Cached | `getCachedQRCode` | `getCachedQRCode` | ✅ Unified |
| Clear Cache | `clearQRCodeCache` | `clearQRCodeCache` | ✅ Unified |
| Cache Stats | `getCacheStats` | `getCacheStats` | ✅ Unified |
| Configure Cache | `configureCache` | `configureCache` | ✅ Unified |

### Constants

| Constant | qrcode-js | qrcode-wasm (Unified) | Status |
|----------|-----------|----------------------|--------|
| Version | `VERSION` | `VERSION` | ✅ Unified |
| Version Info | `getVersionInfo()` | `getVersionInfo()` | ✅ Unified |

## Usage Example

```typescript
import { 
  QRCodeCore, 
  generateRoundedQRCode,
  generateQRCodeAsync,
  QRErrorCorrectLevel 
} from '@veaba/qrcode-wasm';

// Initialize WASM (required before use)
import init from '@veaba/qrcode-wasm';
await init();

// Using core class
const qr = new QRCodeCore('Hello World', QRErrorCorrectLevel.H);
const svg = qr.toSVG(256);

// Using style generators
const roundedSvg = generateRoundedQRCode('Hello', 256, 8);

// Using async generation
const result = await generateQRCodeAsync('Hello', {
  size: 256,
  correctLevel: QRErrorCorrectLevel.H
});
```

## WASM-Specific Features

The following features are unique to `@veaba/qrcode-wasm` and not available in `@veaba/qrcode-js`:

| Feature | Function | Description |
|---------|----------|-------------|
| Thread Pool | `init_thread_pool(n)` | Initialize parallel processing |
| Parallel Check | `is_parallel_supported()` | Check if parallel feature is enabled |
| Low-level Generator | `QRCodeGenerator` | Reusable generator instance |
| Styled Generator | `StyledQRCode` | Advanced style generator |

## Internal Mapping

The wrapper maps CamelCase API to underlying snake_case WASM functions:

```typescript
// Wrapper (CamelCase)
export function generateRoundedQRCode(text: string, size: number, radius: number): string {
  // Maps to WASM (snake_case)
  return generate_rounded_qrcode(text, size, radius);
}
```

## Migration Guide

If you were using the old snake_case API:

```typescript
// Old API (still works via WASM)
import { generate_rounded_qrcode } from '@veaba/qrcode-wasm/pkg/wasm_qrcode.js';

// New Unified API (recommended)
import { generateRoundedQRCode } from '@veaba/qrcode-wasm';
```

Both APIs are functionally equivalent, but the CamelCase version is recommended for consistency with the JavaScript ecosystem.
