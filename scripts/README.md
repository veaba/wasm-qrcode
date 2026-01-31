# 基准测试脚本

本目录包含 QRCode 项目的后端基准测试脚本。

## 快速开始

### 一键运行所有后端测试

```bash
pnpm run benchmark
```

这将运行：
1. Node.js 后端基准测试
2. Bun 后端基准测试（如果已安装）
3. Rust 基准测试（如果已安装）
4. 生成汇总数据到 `public/` 目录

### 查看结果

```bash
# 启动开发服务器
pnpm run dev

# 打开 Benchmark.vue 查看所有测试结果
# http://localhost:5173/benchmark
```

## 单独运行测试

```bash
# 所有后端测试
pnpm run benchmark:backend

# 单独测试
pnpm run benchmark:node
pnpm run benchmark:bun
pnpm run benchmark:rust
```

## 命令行选项

```bash
# 只运行 Node.js
node scripts/benchmark.js --node

# 只运行 Bun
node scripts/benchmark.js --bun

# 只运行 Rust
node scripts/benchmark.js --rust
```

## 输出文件

运行基准测试后会生成以下文件到 `public/` 目录：

```
public/
├── benchmark_node_result.json   # Node.js 测试结果
├── benchmark_bun_result.json    # Bun 测试结果
├── benchmark_rust_result.json   # Rust 测试结果
└── benchmark_summary.json       # 汇总信息
```

这些文件会被 `Benchmark.vue` 自动加载展示。

## 在 Benchmark.vue 中查看

`Benchmark.vue` 会自动：
1. 加载 `public/benchmark_*_result.json` 文件
2. 展示后端测试结果
3. 提供前端实时基准测试功能
4. 展示跨平台对比图表

## 清理测试数据

```bash
pnpm run benchmark:clean
```

## 环境要求

- **Node.js**: >= 18.0.0
- **Bun**: >= 1.0.0 (可选)
- **Rust**: >= 1.70.0 (可选)
- **pnpm**: >= 8.0.0

## 故障排除

### Node.js 测试失败

```bash
cd packages/qrcode-node && pnpm install
npx ts-node benchmark/index.ts
```

### Bun 测试失败

```bash
# 安装 Bun
curl -fsSL https://bun.sh/install | bash
```

### Rust 测试失败

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
