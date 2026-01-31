import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: '.',
  title: 'Wasm QRCode',
  description: '高性能 QRCode 生成库 - 支持 WASM、Node.js、Bun 和 Rust',
  // icon: '/logo.png',
  // logo: '/logo.png',
  logoText: 'Wasm QRCode',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '性能对比', link: '/guide/performance' },
          ],
        },
        {
          text: '前端包',
          items: [
            { text: '@veaba/qrcode-wasm', link: '/guide/qrcode-wasm' },
            { text: '@veaba/qrcodejs', link: '/guide/qrcodejs' },
          ],
        },
        {
          text: '后端包',
          items: [
            { text: '@veaba/qrcode-node', link: '/guide/qrcode-node' },
            { text: '@veaba/qrcode-ts (Bun)', link: '/guide/qrcode-ts' },
            { text: '@veaba/qrcode-rust', link: '/guide/qrcode-rust' },
          ],
        },
        {
          text: '共享库',
          items: [
            { text: '@veaba/shared', link: '/guide/shared' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概览', link: '/api/' },
            { text: 'QRCodeCore', link: '/api/core' },
            { text: 'QRCodeWasm', link: '/api/wasm' },
            { text: '缓存系统', link: '/api/cache' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/veaba/wasm-qrcode' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present veaba',
    },
  },
});
