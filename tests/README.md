# 单元测试目录

本目录包含所有 `@veaba/qrcode` 包的单元测试，从各自的 `packages/` 目录迁移至此，以保持包目录的干净。

## 📁 目录结构

```
tests/
├── qrcode-bun/          # Bun 运行时测试
│   └── index.test.ts
├── qrcode-js/           # JavaScript 通用测试
│   └── index.test.ts
├── qrcode-node/         # Node.js 运行时测试
│   └── index.test.ts
├── qrcode-js-shared/       # 共享核心库测试
│   └── index.test.ts
└── qrcode-wasm/         # WebAssembly 测试
    ├── index.test.ts
    └── pkg.test.ts
```

## 🚀 运行测试

### 运行所有测试

```bash
# 使用 vitest
npx vitest run

# 或使用 pnpm
pnpm test
```

### 运行特定包的测试

```bash
# Bun 测试
npx vitest run tests/qrcode-bun

# Node.js 测试
npx vitest run tests/qrcode-node

# Shared 核心库测试
npx vitest run tests/qrcode-js-shared
```

### 监视模式

```bash
npx vitest --watch
```

## 📝 测试说明

### qrcode-bun

- **运行环境**: Bun >= 1.0.0
- **测试内容**: Bun 运行时的 QRCode 生成、样式化、批量生成、异步生成
- **特有功能**: Bun 文件 API 测试 (`saveToFile`, `savePNGToFile`)

### qrcode-node

- **运行环境**: Node.js >= 16.0.0
- **测试内容**: Node.js 运行时的 QRCode 生成、PNG Buffer 生成
- **特有功能**: `toPNGBuffer()` 测试

### qrcode-js-shared

- **运行环境**: 任何 JavaScript 运行时
- **测试内容**: 核心 QRCode 算法、数学运算、缓存系统、样式生成
- **重要性**: 这是所有其他包的基础，覆盖最全面的功能测试

### qrcode-js

- **运行环境**: 浏览器/Node.js/Bun
- **测试内容**: 验证从 `qrcode-js-shared` 的 re-export 是否正确

### qrcode-wasm

- **运行环境**: 需要 WASM 模块
- **测试内容**: WASM 模块加载、API 导出验证
- **注意**: 部分测试需要提前构建 WASM 模块 (`wasm-pack build`)

## 🔧 导入路径规范

测试文件中统一使用以下导入路径：

```typescript
// 从 packages 导入被测试的模块
import { QRCode } from '../../packages/qrcode-bun/src/index.ts';

// 从 packages 导入 shared 模块
import { QRCodeCore } from '../../packages/qrcode-js-shared/src/index.js';

// 测试框架
import { describe, it, expect } from 'vitest';
```

## 📦 包目录结构

迁移后，包目录保持干净，只包含源码：

```
packages/qrcode-xxx/
├── src/                 # 源码
├── dist/                # 编译输出（发布时）
├── package.json
├── tsconfig.json
└── README.md
```

## 💡 添加新测试

1. 在对应的 `tests/{package-name}/` 目录下创建 `.test.ts` 文件
2. 使用统一的导入路径格式：`../../packages/{package}/src/index.ts`
3. 运行 `npx vitest run` 验证测试通过
