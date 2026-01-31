/// <reference types='vite/client' />

declare module '*.vue' {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.wasm' {
  const content: any;
  export default content;
}

declare module '../wasm-qrcode/pkg/wasm_qrcode.js' {
  export * from 'wasm-qrcode/pkg/wasm_qrcode';
}
