# qrcodes

## 环境介绍

当前宿主机环境：

- `windows` 平台
- `node`:`v20.19.`
- `bun` `1.3.0`

## 包介绍

这是一个 `pnpm monorepo`，包含两个维度的包，子包在 `packages` 目录下。

### 前端包

- `@veaba/qrcode-js`TypeScript 写代码，使用 `tsdown` 来打包为 bundle，直接可以在浏览器中运行, 会发布到 `npm`
- `@veaba/qrcode-wasm`，Rust wasm 代码，wasm-pack 构建，给浏览器使用, 会发布到 `npm`

注意： ``@veaba/qrcode-js` 和 `@veaba/qrcode-wasm` 的 API 必须完成一样，现在就是，如果不是需要更新 API

### 后端包

- `@veaba/qrcode-node`，node 运行时，js 写，`"type":module"`, 会发布到 `npm`
- `@veaba/qrcode-bun`，bun 运行时，ts 写, 会发布到 `npm`

### Rust Crates (纯 Rust，发布到 crates.io)

- `@veaba/qrcode-rust`， 对 `@veaba/qrcode-js` rust 化的纯 Rust 包，会发布到 `crates.io`
- `@veaba/qrcode-fast`，是对标 rust 流行的 `kennytm-qrcode` 优化的纯 Rust 包，会发布到 `crates.io`

**注意**: 这两个包是纯 Rust 库，不包含 WASM 绑定，使用 `cargo` 构建和测试。

### 共享包

- `@veaba/qrcode-shared`，共享的代码，不会发布到 npm，`private: true`

## 基准测试

- `/bench` 目录基准测试的代码
- `/scripts` 是用于测试的脚本
- **详细指南**: 参见 `skills/BENCHMARK.md`

### 基准测试结构（已整理）

```
bench/
├── backend-benchmark-pk/          # 后端包 PK 基准测试（多包对比）
│   ├── index.ts                   # 主测试脚本，对比 3 个包
│   └── package.json
├── frontend-benchmark/            # 前端包基准测试
│   ├── index.ts                   # TypeScript 版本（需构建后运行）
│   ├── benchmark.cjs              # CommonJS 版本（直接运行）
│   └── dist/
├── kennytm-qrcode/               # 外部对比包（社区 Rust QRCode，勿动）
│   └── src/
└── rust-tools/            # 二维码验证工具集
    └── src/bin/
        ├── validate-qr.rs         # 二维码生成+验证工具
        └── verified-qr.rs         # 高性能二维码生成器
```

**注意**: `benchmark-cross-backend/` 目录已删除（功能被 PK 测试覆盖）

### 各包基准测试位置

| 包名 | 基准测试路径 | 测试框架 | 输出文件 |
|------|-------------|---------|---------|
| `@veaba/qrcode-node` | `packages/qrcode-node/benchmark/index.js` | 自定义 | `benchmark/benchmark_result.json` |
| `@veaba/qrcode-bun` | `packages/qrcode-bun/benchmark/index.ts` | 自定义 | `benchmark_result.json` |
| `@veaba/qrcode-js` | `bench/frontend-benchmark/benchmark.cjs` | 自定义 | `frontend_benchmark_result.json` |
| `@veaba/qrcode-rust` | `packages/qrcode-rust/benches/` | Criterion | `target/criterion/` |
| `@veaba/qrcode-fast` | `packages/qrcode-fast/benches/` | Criterion | `target/criterion/` |
| `kennytm-qrcode` | `bench/kennytm-qrcode/` | Criterion | - |

### PK 基准测试（多包对比）

PK 测试对比以下 3 个后端包：

| 包名 | 运行时 | 说明 |
|------|--------|------|
| `@veaba/qrcode-node` | Node.js | JavaScript 实现 |
| `@veaba/qrcode-bun` | Bun | TypeScript 实现 |
| `@veaba/qrcode-fast` | Rust | 优化的 Rust 实现 |

**测试维度**：

- 单条生成（short/medium/long/unicode）
- 批量生成（10/100/1000 条）
- SVG 输出
- 纠错级别（L/M/Q/H）

**运行命令**：

```bash
# 完整 PK 测试（包含 Rust benchmark，耗时约 5 分钟）
cd bench/backend-benchmark-pk
npx tsx index.ts

# 快速 PK 测试（使用缓存的 Rust 结果）
npx tsx index-fast.ts
```

### 输出文件位置

所有基准测试结果保存在 `docs/public/` 目录：

| 文件 | 说明 | 大小(典型) |
|------|------|-----------|
| `frontend_benchmark_result.json` | 前端 @veaba/qrcode-js 测试结果 | ~2 KB |
| `benchmark_node_result.json` | Node.js 后端测试结果 | ~2.5 KB |
| `benchmark_bun_result.json` | Bun 后端测试结果 | ~2.8 KB |
| `backend_benchmark_pk.json` | PK 完整对比结果 | ~13 KB |
| `backend_benchmark_pk_summary.json` | PK 摘要结果 | ~7 KB |
| `benchmark_summary.json` | 所有测试汇总 | ~0.1 KB |

### bench 文档

- `/docs/bench/index.mdx` - 基准测试总览
- `/docs/bench/front-bench.mdx` - 前端包比较
- `/docs/bench/backend-bench.mdx` - 后端包比较（Node.js vs Bun）
- `/docs/bench/backend-pk.mdx` - 后端包 PK 对比（多包对比）
- `/docs/bench/compare-rust.mdx` - Rust 包对比（kennytm vs qrcode-fast）

## 测试

1. 对于前端包，使用 `pnpm run test`，使用 `vitest` 来测试，它有 `browser` 模式，可以测试浏览器环境
2. 对于 Rust 包，使用 `cargo test` 进行测试
3. 产生的 `svg` 文件 和 json 放在 `/docs/public` 中

## 文档

- `/docs` 目录，包含文档，使用  `rspress` 来驱动
- `/docs/bench` 中包含下面文件
  - `/docs/bench/index.mdx` - 基准测试总览
  - `/docs/bench/front-bench.mdx` - 前端包比较
  - `/docs/bench/backend-bench.mdx` - 后端包比较
  - `/docs/bench/backend-pk.mdx` - PK 多包对比
  - `/docs/bench/compare-rust.mdx` - Rust 包对比
- `/docs` 中的 `.mdx` 可以使用  `react+markdown` 语法
- `/docs/public`目录，可以放一些必要的基准测试数据，比如对后端版本产生的 `json` 数据
