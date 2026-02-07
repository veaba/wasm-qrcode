# API Consistency Reference

This document tracks API consistency across packages in the @veaba/qrcodes monorepo.

Last updated: 2026-02-02

## Backend Packages: qrcode-node vs qrcode-bun

### ✅ Identical APIs

These APIs are identical between `@veaba/qrcode-node` and `@veaba/qrcode-bun`:

#### QRCode Class
| Property/Method | Type | Description |
|----------------|------|-------------|
| `text` | `string` | QR code content |
| `correctLevel` | `QRErrorCorrectLevel` | Error correction level |
| `typeNumber` | `number` | QR code version |
| `moduleCount` | `number` | Module count (size) |
| `isDark(row, col)` | `boolean` | Check if module is dark |
| `getModuleCount()` | `number` | Get module count |
| `toSVG(size?)` | `string` | Generate SVG |
| `toStyledSVG(options?)` | `string` | Generate styled SVG |

#### Constants
| Constant | Type | Values |
|----------|------|--------|
| `QRErrorCorrectLevel` | `enum` | `L=1, M=0, Q=3, H=2` |
| `QRMode` | `const` | `{ MODE_8BIT_BYTE: 4 }` |

#### Style Generator Functions
| Function | Signature |
|----------|-----------|
| `generateRoundedQRCode` | `(text, size?, radius?) => string` |
| `generateQRCodeWithLogoArea` | `(text, size?, logoRatio?) => string` |
| `generateGradientQRCode` | `(text, size?, color1?, color2?) => string` |
| `generateWechatStyleQRCode` | `(text, size?) => string` |
| `generateDouyinStyleQRCode` | `(text, size?) => string` |
| `generateAlipayStyleQRCode` | `(text, size?) => string` |
| `generateXiaohongshuStyleQRCode` | `(text, size?) => string` |
| `generateCyberpunkStyleQRCode` | `(text, size?) => string` |
| `generateRetroStyleQRCode` | `(text, size?) => string` |
| `generateMinimalStyleQRCode` | `(text, size?) => string` |

#### Batch/Async Functions
| Function | Signature |
|----------|-----------|
| `generateBatchQRCodes` | `(texts[], options?) => string[]` |
| `generateQRCodeAsync` | `(text, options?) => Promise<string>` |
| `generateBatchAsync` | `(texts[], options?) => Promise<string[]>` |

### ⚠️ Platform-Specific APIs

These APIs are intentionally different due to runtime capabilities:

#### qrcode-node only
| Method | Return Type | Description |
|--------|-------------|-------------|
| `toPNGBuffer(size?)` | `Buffer` | Generate PNG as Node.js Buffer |

#### qrcode-bun only
| Method | Return Type | Description |
|--------|-------------|-------------|
| `saveToFile(filepath, size?)` | `Promise<void>` | Save SVG to file |
| `savePNGToFile(filepath, size?)` | `Promise<void>` | Save PNG to file |
| `getModulesJSON()` | `string` | Get modules as JSON string |

### Test Coverage

- **qrcode-node**: 35 tests passing
- **qrcode-bun**: 36 tests passing
- **Total**: 218 tests passing across all packages

## Frontend Packages: qrcode-js vs qrcode-wasm

**Status**: Both packages must have identical APIs. Verify when making changes.

## Shared Package: qrcode-shared

The `@veaba/qrcode-shared` package provides:
- Core QRCode logic (`QRCodeCore` class)
- Shared types and interfaces
- Style generator implementations
- Utility functions

**Note**: This is a private package (not published). Changes here affect both qrcode-node and qrcode-bun.

## Verification Commands

```bash
# Run all tests
pnpm test

# Test specific packages
pnpm test -- packages/qrcode-node
pnpm test -- packages/qrcode-bun

# Check TypeScript compilation
cd packages/qrcode-node && npx tsc --noEmit
cd packages/qrcode-bun && npx tsc --noEmit
```

## Recent Changes

### 2026-02-02
- Fixed `generateAlipayStyleQRCode` implementation in shared package to use Alipay blue (`#1677FF`)
- Unified test assertions between qrcode-node and qrcode-bun
- Added missing `toStyledSVG with quiet zone` test to qrcode-node
- Removed unused imports from qrcode-bun tests
