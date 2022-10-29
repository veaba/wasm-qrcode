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

```text
- qrcodejs // https://github.com/davidshimjs/qrcodejs，拆分了子函数，并移除 svg 部分内容
  - 使用 parcel 打包
- wasm-qrcode  // wasm 版本的 qrcode

```
