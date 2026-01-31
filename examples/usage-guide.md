# 双引擎使用指南

## 概述

wasm-qrcode 提供两个引擎：
- **WASM 引擎**（推荐）- 高性能，适合现代浏览器
- **JS 引擎**（兼容）- 纯 JavaScript，无需加载 WASM

---

## 1. WASM 引擎使用

### 方式一：基础 API（旧版，向后兼容）

```javascript
import init, { QRCodeWasm } from './wasm-qrcode/pkg/wasm_qrcode.js'

// 初始化 WASM
await init()

// 每次创建新实例（适合单次生成）
const qr = new QRCodeWasm()
qr.make_code('https://example.com')

const svg = qr.get_svg()
document.body.innerHTML = svg

// 必须手动释放内存
qr.free()
```

**缺点**：每次创建/销毁，有内存开销

---

### 方式二：生成器 API（新版，推荐）

```javascript
import init, { QRCodeGenerator } from './wasm-qrcode/pkg/wasm_qrcode.js'

await init()

// 创建一次，复用实例
const gen = new QRCodeGenerator()

// 场景 1：单个生成
gen.generate('https://example.com')
const svg1 = gen.get_svg()

// 场景 2：批量生成（性能最优）
const texts = [
  'https://example.com/1',
  'https://example.com/2',
  'https://example.com/3',
  // ... 几千个
]
const svgs = gen.generate_batch(texts)

// 无需手动释放，自动内存管理
```

**优点**：实例复用，批量生成快 10 倍

---

### 方式三：样式化 QRCode

```javascript
import init, { 
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode,
  generate_gradient_qrcode
} from './wasm-qrcode/pkg/wasm_qrcode.js'

await init()

// 一键生成微信风格
const wechatSvg = generate_wechat_style_qrcode('https://weixin.qq.com', 256)

// 一键生成抖音风格  
const douyinSvg = generate_douyin_style_qrcode('https://douyin.com', 256)

// 自定义渐变
const gradientSvg = generate_gradient_qrcode(
  'https://example.com', 
  256, 
  '#667eea',  // 起始色
  '#764ba2'   // 结束色
)
```

---

## 2. JS 引擎使用

### 场景：WASM 加载失败时的降级方案

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 先尝试加载 WASM -->
  <script type="module">
    try {
      const wasm = await import('./wasm-qrcode/pkg/wasm_qrcode.js')
      await wasm.default()
      window.qrEngine = 'wasm'
      window.qrGenerator = new wasm.QRCodeGenerator()
    } catch (e) {
      // WASM 失败，降级到 JS
      console.log('WASM failed, falling back to JS')
      const js = await import('./qrcodejs/src/qrcode.js')
      window.qrEngine = 'js'
      window.QRCode = js.QRCode
    }
  </script>
</head>
<body>
  <div id="qrcode"></div>
  
  <script type="module">
    function generateQR(text) {
      if (window.qrEngine === 'wasm') {
        // 使用 WASM
        window.qrGenerator.generate(text)
        return window.qrGenerator.get_svg()
      } else {
        // 使用 JS 降级
        const qr = new window.QRCode(text, 2) // 2 = H level
        return qr.toSVG()
      }
    }
    
    document.getElementById('qrcode').innerHTML = generateQR('https://example.com')
  </script>
</body>
</html>
```

---

## 3. 完整对比示例

```javascript
// ========== WASM 版本 ==========
import init, { QRCodeGenerator } from './wasm-qrcode/pkg/wasm_qrcode.js'

await init()
const gen = new QRCodeGenerator()

// 批量生成 1000 个
console.time('WASM')
const texts = Array(1000).fill(0).map((_, i) => `https://example.com/${i}`)
const wasmSvgs = gen.generate_batch(texts)
console.timeEnd('WASM') // ~60ms

// ========== JS 版本 ==========
import { QRCode } from './qrcodejs/src/qrcode.js'

// 批量生成 1000 个
console.time('JS')
const jsSvgs = texts.map(t => {
  const qr = new QRCode(t, 2)
  return qr.toSVG()
})
console.timeEnd('JS') // ~600ms

console.log('WASM 比 JS 快 10 倍！')
```

---

## 4. 实际应用场景

### 场景 1：电商网站 - 商品二维码

```javascript
// 商品详情页，生成购买链接二维码
import init, { QRCodeGenerator } from 'wasm-qrcode'

await init()
const gen = new QRCodeGenerator()

// 每个商品页面调用
function showProductQR(productId) {
  const url = `https://shop.com/buy/${productId}`
  gen.generate(url)
  document.getElementById('product-qr').innerHTML = gen.get_svg()
}
```

### 场景 2：活动签到 - 批量生成门票

```javascript
// 活动管理后台，为所有报名者生成门票
import init, { QRCodeGenerator } from 'wasm-qrcode'

await init()
const gen = new QRCodeGenerator()

// 导出所有门票二维码
async function exportTickets(attendees) {
  const tickets = attendees.map(a => ({
    name: a.name,
    code: `EVENT2024-${a.id}`,
    qr: ''
  }))
  
  // 批量生成二维码
  const codes = tickets.map(t => t.code)
  const svgs = gen.generate_batch(codes)
  
  // 分配给每个人
  tickets.forEach((t, i) => t.qr = svgs[i])
  
  return tickets
}
```

### 场景 3：社交媒体 - 个性化分享

```javascript
// 根据平台生成不同风格的二维码
import init, { 
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode 
} from 'wasm-qrcode'

await init()

function getShareQR(platform, url) {
  switch(platform) {
    case 'wechat':
      return generate_wechat_style_qrcode(url, 200)
    case 'douyin':
      return generate_douyin_style_qrcode(url, 200)
    default:
      return generate_minimal_style_qrcode(url, 200)
  }
}

// 使用
const wechatQR = getShareQR('wechat', 'https://myapp.com/share/abc123')
const douyinQR = getShareQR('douyin', 'https://myapp.com/share/abc123')
```

---

## 5. 选择建议

| 场景 | 推荐引擎 | 原因 |
|------|---------|------|
| 现代浏览器 + 批量生成 | WASM | 性能最优 |
| 需要兼容 IE/旧浏览器 | JS | 无需 WASM 支持 |
| 简单页面，1-2 个二维码 | JS | 无需加载 WASM 文件 |
| 大量二维码（>100） | WASM | 速度快 10 倍 |
| 样式化二维码 | WASM | 内置 10+ 样式 |
| Node.js 后端 | 两者皆可 | WASM 稍快 |

---

## 6. 完整 HTML 示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>双引擎 QRCode 演示</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .engine-switch { margin-bottom: 20px; }
    .qrcode-display { padding: 20px; background: #f5f5f5; border-radius: 8px; }
    button { padding: 10px 20px; margin-right: 10px; cursor: pointer; }
    .active { background: #007bff; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 双引擎 QRCode 演示</h1>
    
    <div class="engine-switch">
      <button id="btn-wasm" class="active" onclick="switchEngine('wasm')">WASM 引擎</button>
      <button id="btn-js" onclick="switchEngine('js')">JS 引擎</button>
      <span id="engine-status">当前：WASM</span>
    </div>
    
    <div>
      <input type="text" id="text-input" value="https://github.com/veaba/wasm-qrcode" style="width: 300px; padding: 8px;">
      <button onclick="generate()">生成</button>
    </div>
    
    <div class="qrcode-display" id="result">
      点击生成按钮...
    </div>
  </div>

  <script type="module">
    let currentEngine = 'wasm'
    let wasmGen = null
    let QRCodeJS = null
    
    // 初始化 WASM
    async function initWASM() {
      const wasm = await import('./wasm-qrcode/pkg/wasm_qrcode.js')
      await wasm.default()
      wasmGen = new wasm.QRCodeGenerator()
      return wasm
    }
    
    // 初始化 JS
    async function initJS() {
      const js = await import('./qrcodejs/src/qrcode.js')
      QRCodeJS = js.QRCode
      return js
    }
    
    // 初始化两个引擎
    Promise.all([initWASM(), initJS()]).then(() => {
      console.log('双引擎就绪')
      generate()
    })
    
    // 切换引擎
    window.switchEngine = (engine) => {
      currentEngine = engine
      document.getElementById('btn-wasm').className = engine === 'wasm' ? 'active' : ''
      document.getElementById('btn-js').className = engine === 'js' ? 'active' : ''
      document.getElementById('engine-status').textContent = `当前：${engine.toUpperCase()}`
      generate()
    }
    
    // 生成二维码
    window.generate = () => {
      const text = document.getElementById('text-input').value
      const result = document.getElementById('result')
      
      console.time('生成时间')
      
      if (currentEngine === 'wasm') {
        wasmGen.generate(text)
        result.innerHTML = wasmGen.get_svg()
      } else {
        const qr = new QRCodeJS(text, 2)
        result.innerHTML = qr.toSVG()
      }
      
      console.timeEnd('生成时间')
    }
  </script>
</body>
</html>
```

这个示例展示了如何在同一个页面中切换两个引擎！
