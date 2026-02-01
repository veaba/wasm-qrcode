---
name: qrcodes-dev
description: QRCode monorepo development guide. Use when working with the @veaba/qrcodes project - a multi-runtime QRCode generator supporting JavaScript/TypeScript (browser/Node/Bun), Rust, and WebAssembly. Covers building, testing, benchmarking, and publishing packages.
---

# QRCode Monorepo Development

## Project Overview

This is a pnpm monorepo containing QRCode generators for multiple runtimes and platforms:

### Frontend Packages (Browser)

- `@veaba/qrcode-js` - TypeScript, bundled with tsdown, browser-compatible
- `@veaba/qrcode-wasm` - Rust compiled to WASM for browser use

**Note**: Both frontend packages must have identical APIs.

### Backend Packages (Node.js/Bun)

- `@veaba/qrcode-node` - Node.js runtime, ES modules
- `@veaba/qrcode-bun` - Bun runtime, TypeScript

### Rust Crates (Pure Rust, published to crates.io)

- `@veaba/qrcode-rust` - Pure Rust QRCode generator (Rust port of qrcode-js)
- `@veaba/qrcode-fast` - Optimized Rust QRCode generator (competes with kennytm-qrcode)

**Note**: These are pure Rust libraries without WASM bindings. Use `cargo` to build and test.

### Shared Package

- `@veaba/qrcode-shared` - Core logic, private (not published)

## Environment Requirements

- Windows platform
- Node.js v20.19+
- Bun 1.3.0
- pnpm 9.15.4+
- Rust (for native crates and WASM builds)
- wasm-pack (for WASM builds only)

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Watch mode for development
pnpm run watch
```

### Testing

```bash
# Run all tests
pnpm test

# Unit tests only
pnpm run test:unit

# Browser tests (uses Vitest + Playwright)
pnpm run test:browser

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage

# Rust tests
cd packages/qrcode-rust && cargo test
cd packages/qrcode-fast && cargo test
```

### Benchmarking

```bash
# All benchmarks
pnpm run benchmark

# Backend only
pnpm run benchmark:backend

# Specific runtimes
pnpm run benchmark:node
pnpm run benchmark:bun
pnpm run benchmark:rust

# Clean benchmark results
pnpm run benchmark:clean

# Rust benchmarks
cd packages/qrcode-rust && cargo bench
cd packages/qrcode-fast && cargo bench
```

### Documentation

```bash
# Dev server
pnpm run docs:dev

# Build docs
pnpm run docs:build

# Preview built docs
pnpm run docs:preview
```

### Publishing

```bash
# Check publish readiness
pnpm run publish:check

# Dry run
pnpm run publish:dry-run

# Publish all
pnpm run publish:all
```

## Package-Specific Builds

### @veaba/qrcode-js

```bash
cd packages/qrcode-js
pnpm run build    # tsdown
pnpm run watch    # tsdown --watch
```

### @veaba/qrcode-wasm

```bash
cd packages/qrcode-wasm
pnpm run build           # wasm-pack build --target web
pnpm run build:node      # wasm-pack build --target nodejs
pnpm run build:bundler   # wasm-pack build --target bundler
```

### @veaba/qrcode-node

```bash
cd packages/qrcode-node
pnpm run build    # tsc
pnpm run watch    # tsc --watch
```

### @veaba/qrcode-bun

```bash
cd packages/qrcode-bun
pnpm run build    # tsc
pnpm run watch    # tsc --watch
pnpm run benchmark # bun run benchmark.ts
```

### @veaba/qrcode-rust (Pure Rust)

```bash
cd packages/qrcode-rust
cargo build --release
cargo test
cargo bench               # Run benchmarks
```

### @veaba/qrcode-fast (Pure Rust)

```bash
cd packages/qrcode-fast
cargo build --release
cargo test
cargo bench               # Run benchmarks
```

## API Consistency

### Frontend Packages

**Critical**: `@veaba/qrcode-js` and `@veaba/qrcode-wasm` must have identical APIs.

When modifying either:

1. Check the other package's API
2. Update both if needed
3. Verify with tests

### Backend Packages

**Critical**: `@veaba/qrcode-node` and `@veaba/qrcode-bun` must have identical public APIs (except runtime-specific methods).

Verified API consistency (2026-02-02):

- ✅ Core QRCode class: `text`, `correctLevel`, `typeNumber`, `moduleCount`, `isDark()`, `getModuleCount()`, `toSVG()`, `toStyledSVG()`
- ✅ Constants: `QRErrorCorrectLevel`, `QRMode`
- ✅ Style generators: `generateRoundedQRCode`, `generateQRCodeWithLogoArea`, `generateGradientQRCode`, `generateWechatStyleQRCode`, `generateDouyinStyleQRCode`, `generateAlipayStyleQRCode`, `generateXiaohongshuStyleQRCode`, `generateCyberpunkStyleQRCode`, `generateRetroStyleQRCode`, `generateMinimalStyleQRCode`
- ✅ Batch/Async: `generateBatchQRCodes`, `generateQRCodeAsync`, `generateBatchAsync`
- ⚠️ Platform-specific:
  - `qrcode-node`: `toPNGBuffer()` - returns Node.js Buffer
  - `qrcode-bun`: `saveToFile()`, `savePNGToFile()`, `getModulesJSON()` - Bun file operations

Test coverage: 218 tests passing across both packages.

## Benchmark Reports

Reports are generated in:

- `/docs/bench/backend-bench.md` - Backend package comparison
- `/docs/bench/frontend-bench.md` - Frontend package comparison
- `/docs/bench/compare-rust.md` - kennytm-qrcode vs qrcode-fast
- `/docs/public/` - JSON data and generated assets

### bench/rust-tools

Rust benchmark tools for comparing QRCode implementations.

**Location**: `bench/rust-tools/`

**Available Tools** (13 binaries):

| Binary | Purpose |
|--------|---------|
| `simple-qr` | Basic QR generation with kennytm |
| `fast-qr` | Optimized QR generation |
| `real-qr` | Full-featured QR generation |
| `validate-qr` | Generate and validate QR codes |
| `veaba-qr` | Test @veaba packages |
| `compare-impls` | Compare qrcode-rust vs qrcode-fast (modes: modules, full) |
| `compare-svgs` | SVG performance comparison |
| `debug-qr` | QR code debugging |
| `debug-finder` | Finder pattern debugging (modes: basic, logic) |
| `debug-compare` | Detailed implementation comparison (modes: basic, detail) |
| `verify-kennytm` | Verify kennytm output |
| `test-svgs` | Test SVG files |
| `benchmark-report` | Generate benchmark reports |

**Usage**:

```bash
cd bench/rust-tools

# Build all tools
cargo build --release

# Run specific tool
cargo run --release --bin simple-qr -- "Hello World"
cargo run --release --bin compare-impls -- modules "Test"
cargo run --release --bin debug-finder -- logic
```

**Note**: Tools were consolidated from 29 to 13 binaries (2026-02-02). Removed obsolete scripts that depended on private APIs.

## Testing Outputs

- SVG files and JSON results go to `/docs/public/`
- Browser tests use Vitest with Playwright

## Documentation Structure

- `/docs` - Rspress documentation site
- `/docs/bench/` - Benchmark comparison docs
- `/docs/public/` - Static assets (benchmark data, SVGs)
- MDX files support React + Markdown syntax

## Key Files

- `pnpm-workspace.yaml` - Workspace configuration
- `rsw.toml` - Rust WASM build configuration (for qrcode-wasm only)
- `rspress.config.ts` - Documentation site config
- `PUBLISH.md` - Detailed publishing guide
- `vitest.config.ts` / `vitest.config.browser.ts` - Test configs

## Scripts Directory

`/scripts` contains automation for:

- `test.js` - Test runner
- `benchmark.js` - Benchmark runner
- `benchmark-clean.js` - Clean benchmark artifacts
- `publish-check.js` - Pre-publish validation
- `publish.js` - Publishing automation
