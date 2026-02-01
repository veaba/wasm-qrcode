# @veaba/qrcode-wasm

浏览器环境的 WASM 版本，基于 Rust 编译，提供最佳的 QRCode 生成性能。

## 安装

```bash
npm install @veaba/qrcode-wasm
```

## 初始化

WASM 需要异步初始化，确保在使用前完成初始化：

```typescript
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

// 初始化 WASM
await init();

// 现在可以使用 QRCodeWasm 了
const qr = new QRCodeWasm();
```

## 基础使用

### 创建 QRCode

```typescript
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

await init();

// 创建实例
const qr = new QRCodeWasm();

// 生成 QRCode
qr.make_code('https://github.com/veaba/qrcodes');

// 获取 SVG
const svg = qr.get_svg();
console.log(svg);
// <svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>
```

### 指定纠错级别

```typescript
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 使用高纠错级别
const qr = QRCodeWasm.with_options(256, 256, CorrectLevel.H);
qr.make_code('https://github.com/veaba/qrcodes');
```

纠错级别说明：

| 级别 | 容错率 | 适用场景 |
|------|--------|----------|
| `CorrectLevel.L` | ~7% | 清晰的打印环境 |
| `CorrectLevel.M` | ~15% | 一般场景（默认）|
| `CorrectLevel.Q` | ~25% | 有一定损坏风险 |
| `CorrectLevel.H` | ~30% | Logo 覆盖、艺术化 QRCode |

## 高级用法

### 使用 QRCodeGenerator（可复用实例）

```typescript
import init, { QRCodeGenerator, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 创建可复用的生成器
const gen = new QRCodeGenerator();

// 设置选项
gen.set_options(256, 256, CorrectLevel.H);

// 生成单个 QRCode
gen.generate('https://github.com/veaba/qrcodes/1');
const svg1 = gen.get_svg();

// 复用同一实例生成另一个（性能更好）
gen.generate('https://github.com/veaba/qrcodes/2');
const svg2 = gen.get_svg();

// 批量生成
const texts = ['url1', 'url2', 'url3'];
const svgs = gen.generate_batch(texts);
```

### 样式化 QRCode

```typescript
import init, { StyledQRCode, QRCodeStyle } from '@veaba/qrcode-wasm';

await init();

// 创建样式
const style = new QRCodeStyle();
style.set_size(256);
style.set_colors('#000000', '#ffffff');
style.set_border_radius(8);
style.set_quiet_zone(2);

// 创建带样式的 QRCode
const qr = StyledQRCode.with_style(style);
qr.generate('https://github.com/veaba/qrcodes', CorrectLevel.H);

const svg = qr.get_styled_svg();
```

### 预设样式函数

```typescript
import init, { 
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode,
  generate_cyberpunk_style_qrcode,
  generate_gradient_qrcode,
  generate_rounded_qrcode
} from '@veaba/qrcode-wasm';

await init();

// 微信风格（绿色）
const wechatSvg = generate_wechat_style_qrcode('https://github.com/veaba/qrcodes', 256);

// 抖音风格（渐变色）
const douyinSvg = generate_douyin_style_qrcode('https://github.com/veaba/qrcodes', 256);

// 赛博朋克风格
const cyberpunkSvg = generate_cyberpunk_style_qrcode('https://github.com/veaba/qrcodes', 256);

// 渐变背景
const gradientSvg = generate_gradient_qrcode(
  'https://github.com/veaba/qrcodes', 
  256, 
  '#667eea',  // 起始色
  '#764ba2'   // 结束色
);

// 圆角 QRCode
const roundedSvg = generate_rounded_qrcode('https://github.com/veaba/qrcodes', 256, 8);
```

## Canvas 渲染

如果需要像素数据用于 Canvas：

```typescript
import init, { CanvasRenderer } from '@veaba/qrcode-wasm';

await init();

// 创建 Canvas 渲染器
const renderer = new CanvasRenderer(256, 256);

// 设置颜色（RGBA）
renderer.set_colors(
  0, 0, 0, 255,      // 深色: 黑色
  255, 255, 255, 255 // 浅色: 白色
);

// 渲染 QRCode
const pixelData = renderer.render('https://github.com/veaba/qrcodes', CorrectLevel.H);

// 使用 ImageData 显示
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = new ImageData(
  new Uint8ClampedArray(pixelData), 
  256, 
  256
);
ctx.putImageData(imageData, 0, 0);
```

## 在框架中的最佳实践

### React Hook

```typescript
// hooks/useQRCode.ts
import { useEffect, useState, useCallback } from 'react';
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: string) {
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      if (!initialized) {
        await init();
        initialized = true;
      }
      
      const qr = new QRCodeWasm();
      qr.make_code(text);
      setSvg(qr.get_svg());
      setLoading(false);
    };

    generate();
  }, [text]);

  return { svg, loading };
}
```

### Vue Composable

```typescript
// composables/useQRCode.ts
import { ref, watch, onMounted } from 'vue';
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: Ref<string>) {
  const svg = ref('');
  const loading = ref(true);

  const generate = async () => {
    if (!initialized) {
      await init();
      initialized = true;
    }
    
    const qr = new QRCodeWasm();
    qr.make_code(text.value);
    svg.value = qr.get_svg();
    loading.value = false;
  };

  onMounted(generate);
  watch(text, generate);

  return { svg, loading };
}
```

## API 参考

### QRCodeWasm

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `new()` | 创建实例 | `QRCodeWasm` |
| `with_options(w, h, level)` | 带选项创建 | `QRCodeWasm` |
| `make_code(text)` | 生成 QRCode | `void` |
| `get_svg()` | 获取 SVG | `string` |
| `get_module_count()` | 获取模块数 | `number` |
| `get_modules_json()` | 获取模块数据 | `string` |
| `is_dark(row, col)` | 判断模块颜色 | `boolean` |
| `free()` | 释放内存 | `void` |

### QRCodeGenerator

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `new()` | 创建实例 | `QRCodeGenerator` |
| `set_options(w, h, level)` | 设置选项 | `void` |
| `generate(text)` | 生成 QRCode | `void` |
| `generate_batch(texts)` | 批量生成 | `string[]` |
| `get_svg()` | 获取 SVG | `string` |
| `clear()` | 清除缓存 | `void` |

## 性能提示

1. **复用实例**：使用 `QRCodeGenerator` 而不是反复创建 `QRCodeWasm`
2. **批量生成**：使用 `generate_batch` 比循环调用 `generate` 更快
3. **及时释放**：WASM 对象需要手动调用 `free()` 释放内存
4. **缓存初始化**：在应用启动时初始化 WASM，避免首次生成时的延迟
