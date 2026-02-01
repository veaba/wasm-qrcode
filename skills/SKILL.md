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

### rust 版本比较

- 查看 `bench/kennytm-qrcode`  和  `qrcode-fast-tools`，对于两者，我们进行基准测试，比较 `@veaba/qrcode-fast` 和 `kennytm-qrcode`

### bench 报告的输出

- `/docs/bench/backend-bench.md` 用于后端包的比较
- `/docs/bench/frontend-bench.md` 用于前端包的比较
- `/docs/bench/compare-rust.md` 用于比较 `kennytm-qrcode` 和 `qrcode-fast` 的性能
- 有产生的 `markdown`报告可以放在 `/docs/public` 中

## 测试

1. 对于前端包，使用 `pnpm run test`，使用 `vitest` 来测试，它有 `browser` 模式，可以测试浏览器环境
2. 对于 Rust 包，使用 `cargo test` 进行测试
3. 产生的 `svg` 文件 和 json 放在 `/docs/public` 中

## 文档

- `/docs` 目录，包含文档，使用  `rspress` 来驱动
- `/docs/bench` 中包含下面三个文件
  - `/docs/bench/backend-bench.md` 用于后端包的比较
  - `/docs/bench/frontend-bench.md` 用于前端包的比较
  - `/docs/bench/compare-rust.md` 用于比较 `kennytm-qrcode` 和 `qrcode-fast` 的性能
- `/docs` 中的 `.mdx` 可以使用  `react+markdown` 语法
- `/docs/public`目录，可以放一些必要的基准测试数据，比如对后端版本产生的 `json` 数据
