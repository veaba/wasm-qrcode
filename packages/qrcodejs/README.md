# @veaba/qrcodejs

浏览器兼容的 QRCode 库 - 纯 JavaScript 实现。

## 简介

这是一个浏览器友好的 QRCode 生成库，不依赖 Node.js 特有的 API，可直接在浏览器中使用。

## 安装

```bash
npm install @veaba/qrcodejs
# 或
pnpm add @veaba/qrcodejs
# 或
yarn add @veaba/qrcodejs
```

## 特性

- 🌐 **浏览器优先** - 纯 JavaScript，无 Node.js 依赖
- 🌐 **轻量级** - 体积小，加载快
- 🌐 **SVG 输出** - 生成矢量图形，清晰锐利
- 🌐 **TypeScript 支持** - 包含类型定义文件

## 使用方法

### 基础用法

```javascript
import { QRCode, QRErrorCorrectLevel } from '@veaba/qrcodejs';

// 创建 QRCode 实例
const qr = new QRCode('Hello World', QRErrorCorrectLevel.H);

// 获取 SVG
const svg = qr.toSVG(256);

// 插入到页面
document.getElementById('qrcode').innerHTML = svg;
```

### 在 HTML 中直接使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { QRCode } from './dist/index.js';
    
    const qr = new QRCode('https://example.com');
    document.getElementById('qrcode').innerHTML = qr.toSVG(256);
  </script>
</head>
<body>
  <div id="qrcode"></div>
</body>
</html>
```

## API

### QRCode 类

#### 构造函数

```javascript
new QRCode(text: string, correctLevel?: QRErrorCorrectLevel)
```

#### 方法

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `toSVG(size?: number)` | `string` | 生成 SVG 字符串 |

### 错误纠正级别

```javascript
const QRErrorCorrectLevel = {
  L: 1,  // 低 (~7%)
  M: 0,  // 中 (~15%)
  Q: 3,  // 较高 (~25%)
  H: 2   // 高 (~30%)
};
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 监听模式
npm run watch
```

## 相关包

- `qrcodejs-cache` - 带缓存的优化版本
- `qrcodejs-perf` - 无缓存的高性能版本
- `qrcode-node` - Node.js 版本

## License

MIT
