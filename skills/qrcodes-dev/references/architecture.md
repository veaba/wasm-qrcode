# QRCode Monorepo Architecture

## Directory Structure

```
qrcodes/
├── packages/
│   ├── qrcode-shared/      # Core logic (private)
│   ├── qrcode-js/          # Browser TypeScript
│   ├── qrcode-wasm/        # Rust WASM for browser
│   ├── qrcode-node/        # Node.js runtime
│   ├── qrcode-bun/         # Bun runtime
│   ├── qrcode-rust/        # Rust crate (WASM + native)
│   └── qrcode-fast/        # Optimized Rust crate
├── docs/                   # Rspress documentation
│   ├── bench/              # Benchmark reports
│   └── public/             # Static assets
├── bench/                  # Benchmark code
├── scripts/                # Automation scripts
└── skills/                 # Development skills
```

## Dependency Graph

```
qrcode-shared (private)
    ├── qrcode-js
    ├── qrcode-node
    └── qrcode-bun

qrcode-wasm (Rust/WASM, independent)

qrcode-rust (Rust crate, independent)
qrcode-fast (Rust crate, independent)
```

## Build Outputs

| Package | Output | Target |
|---------|--------|--------|
| qrcode-js | `dist/*.js` | Browser (ESM + IIFE) |
| qrcode-wasm | `pkg/` | Browser (WASM) |
| qrcode-node | `dist/*.js` | Node.js (ESM) |
| qrcode-bun | `dist/*.js` | Bun (ESM) |
| qrcode-rust | `target/` + `pkg/` | Rust + WASM |
| qrcode-fast | `target/` | Rust only |

## Publishing Targets

| Package | Registry | Name |
|---------|----------|------|
| qrcode-js | npm | `@veaba/qrcode-js` |
| qrcode-wasm | npm | `@veaba/qrcode-wasm` |
| qrcode-node | npm | `@veaba/qrcode-node` |
| qrcode-bun | npm | `@veaba/qrcode-bun` |
| qrcode-rust | crates.io | `qrcode-rust` |
| qrcode-fast | crates.io | `qrcode-fast` |

## Technology Stack

### JavaScript/TypeScript
- **Bundler**: tsdown (for qrcode-js), tsc (for others)
- **Test**: Vitest + Playwright
- **Docs**: Rspress

### Rust
- **Build**: cargo, wasm-pack
- **WASM**: wasm-bindgen
- **Benchmark**: criterion

### Package Management
- **Manager**: pnpm
- **Workspace**: pnpm-workspace.yaml
