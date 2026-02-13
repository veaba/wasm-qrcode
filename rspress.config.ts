import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: './docs',
  title: 'QRCodes',
  description: '高性能 QRCode 生成库 - 支持 WASM、Node.js、Bun 和 Rust',
  icon: '/favicon.png',
  logo: '/favicon.png',
  logoText: 'QRCodes',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '演示', link: '/demo' },
      { text: 'API', link: '/api/' },
      { text: '基准测试', link: '/bench/' },
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
            { text: '@veaba/qrcode-js', link: '/guide/qrcode-js' },
          ],
        },
        {
          text: '后端包',
          items: [
            { text: '@veaba/qrcode-node', link: '/guide/qrcode-node' },
            { text: '@veaba/qrcode-bun (Bun)', link: '/guide/qrcode-bun' },
            { text: '@veaba/qrcode-rust', link: '/guide/qrcode-rust' },
            { text: '@veaba/qrcode-fast ⚡', link: '/guide/qrcode-fast' },
          ],
        },
        {
          text: '共享库',
          items: [
            { text: '@veaba/qrcode-js-shared', link: '/guide/qrcode-js-shared' },
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
      { icon: 'github', mode: 'link', content: 'https://github.com/veaba/qrcodes' },
    ],
    footer: {
      message: 'Copyright © 2024-present veaba.',
    },
  },
});
