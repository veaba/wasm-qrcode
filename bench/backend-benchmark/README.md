# Backend Benchmark PK

后端 QRCode 包 PK 基准测试 - 统一管理与对比多个后端实现的性能。

## 支持的包

| 包名 | 运行时 | 描述 | 测试方式 |
|------|--------|------|----------|
| `@veaba/qrcode-node` | Node.js | Node.js QRCode 实现 | 动态导入 + 内联测试 |
| `@veaba/qrcode-bun` | Bun | Bun QRCode 实现 | 动态导入 + 内联测试 |
| `@veaba/qrcode-fast` | Rust | Rust 优化版 QRCode | 缓存结果 / 实时编译 |
| `@veaba/qrcode-rust` | Rust | Rust QRCode 实现 | 缓存结果 / 实时编译 |
| `kennytm-qrcode` | Rust | 社区流行的 Rust QRCode | 缓存结果 / 实时编译 |

## 使用

```bash
# 完整基准测试（运行所有包）
npm run bench

# 快速版（使用缓存的 Rust 结果）
npm run bench:fast

# 使用 Bun 运行（如果可用）
npm run bench:bun
```

## 文件说明

- `index.ts` - 完整基准测试，实时运行所有包（包括 Rust 编译）
- `index-fast.ts` - 快速基准测试，使用缓存的 Rust 结果，仅测试 Node.js 和 Bun
- `package.json` - 脚本配置

## 测试结果

测试结果会保存到 `docs/public/` 目录：
- `backend_benchmark_pk.json` - 完整结果
- `backend_benchmark_pk_summary.json` - 摘要结果

## 历史迁移

- **2026-02-06**: `@veaba/qrcode-node` 的基准测试从 `packages/qrcode-node/benchmark/` 迁移至此，内联到 `index.ts` 和 `index-fast.ts` 中
- **2026-02-06**: `@veaba/qrcode-bun` 的基准测试从 `packages/qrcode-bun/benchmark/` 迁移至此，内联到 `index.ts` 和 `index-fast.ts` 中
- **2026-02-06**: 合并 `bench/compare_rust` 功能（删除原目录）
- **2026-01-31**: 从 `packages/qrcode-fast` 迁移至此
