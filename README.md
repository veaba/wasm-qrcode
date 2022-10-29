# wasm-qrcode

QRcode for Rust wasm.

## setup

```shell
pnpm i  #

pnpm run dev # dev

yarn rsw watch # watch rust code generate wasm */pkg/*.js

```

## Note

- rust >>>
- rust charCodeAt

## Folder

```js
|-- LICENSE
|-- README.md
|-- index.html
|-- package.json
|-- qrcodejs // https://github.com/davidshimjs/qrcodejs，拆包，并移除 svg 部分内容
|   |-- dist
|   |   |-- index.js
|   |   `-- index.js.map
|   |-- index.html
|   |-- package.json
|   |-- pnpm-lock.yaml
|   `-- src
|       |-- index.js
|       |-- qr-canvas.js
|       |-- qr-code.js
|       |-- qr-drawing.js
|       |-- qr-no-canvas.js
|       |-- qr-svg.js
|   `-- vite-env.d.ts
|-- tsconfig.node.json
|-- vite.config.ts
`-- wasm-qrcode // wasm 版本的 qrcode
    |-- Cargo.lock
    |-- Cargo.toml
    |-- LICENSE
    |-- README.md
    |-- src
    |   |-- QR8bitByte_class.rs
    |   |-- QRBitBuffer_class.rs
    |   |-- bitBuffer_class.rs
    |   |-- code.rs
    |   |-- codeModel_class.rs
    |   |-- drawing_class.rs
    |   |-- lib.rs
    |   |-- main.rs
    |   |-- polynomial_class.rs
    |   |-- rs_block.rs
    |   |-- shared.rs
    |   `-- utils.rs
    `-- tests
        `-- web.rs

```

## Features

- svg support TODO
- [x] canvas √