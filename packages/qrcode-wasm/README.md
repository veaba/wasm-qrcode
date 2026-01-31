# qrcode-wasm

使用 Rust + WebAssembly 的高性能 QRCode 生成器。

## 简介

基于 Rust 实现并编译为 WebAssembly 的 QRCode 生成器，提供接近原生的性能。

## 特性

- ⚡ **高性能** - Rust + WASM 提供接近原生的执行速度
- ⚡ **并行计算** - 支持多线程并行生成（需配置）
- ⚡ **轻量级** - WASM 文件体积小
- ⚡ **浏览器 + Node.js** - 双平台支持

## 安装

```bash
npm install qrcode-wasm
# 或
pnpm add qrcode-wasm
# 或
yarn add qrcode-wasm
```

## 使用方法

### 基础用法

```javascript
import init, { generate_qrcode } from 'qrcode-wasm';

// 初始化 WASM
await init();

// 生成 QRCode
const svg = generate_qrcode('Hello World');
```

### 在 HTML 中使用

```html
<script type="module">
  import init, { generate_qrcode } from './pkg/qrcode_wasm.js';
  
  async function run() {
    await init();
    const svg = generate_qrcode('https://github.com/veaba/wasm-qrcode');
    document.getElementById('qrcode').innerHTML = svg;
  }
  
  run();
</script>
```

## 开发

### 环境要求

- Rust
- wasm-pack
- Node.js

### 构建

```bash
# 安装 wasm-pack
cargo install wasm-pack

# 构建 WASM
wasm-pack build --target web

# 构建 Node.js 版本
wasm-pack build --target nodejs
```

### 运行测试

```bash
# Rust 测试
cargo test

# WASM 测试
wasm-pack test --headless --firefox
```

### 构建发布版本

```bash
# 优化构建
wasm-pack build --release --target web
```

## 性能对比

| 实现 | 相对性能 | 适用场景 |
|------|----------|----------|
| qrcode-wasm | ⚡⚡⚡ 最快 | 高性能需求 |
| qrcodejs-perf | ⚡⚡ 快 | 一般浏览器环境 |
| qrcodejs-cache | ⚡⚡ 快 | 重复生成场景 |

## 相关包

- `qrcodejs-cache` - JavaScript 缓存版本
- `qrcodejs-perf` - JavaScript 高性能版本
- `qrcode-node` - Node.js 版本

## License

MIT
