# QRCodeWasm

`QRCodeWasm` 是 `@veaba/qrcode-wasm` 的核心类，基于 Rust 编译为 WebAssembly，提供浏览器环境下的高性能 QRCode 生成。

## 初始化

在使用任何 WASM API 之前，必须先调用 `init`：

```typescript
import init, { QRCodeWasm } from '@veaba/qrcode-wasm';

// 初始化 WASM
await init();

// 现在可以使用 QRCodeWasm 了
const qr = new QRCodeWasm();
```

### init 函数

```typescript
function init(input?: InitInput | Promise<InitInput>): Promise<InitOutput>
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `input` | `InitInput \| Promise<InitInput>` | 否 | 可选的 WASM 模块输入 |

#### 返回值

`Promise<InitOutput>` - 初始化结果

#### 注意事项

- `init()` 只需调用一次，建议放在应用启动时
- 多次调用 `init()` 不会报错，但只有第一次有效
- 在生产环境中，建议缓存初始化状态

```typescript
// 推荐：缓存初始化状态
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await init();
    initialized = true;
  }
}
```

## QRCodeWasm 类

### 构造函数

```typescript
constructor(text: string, correct_level: CorrectLevel)
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 要编码的文本 |
| `correct_level` | `CorrectLevel` | 是 | 纠错级别 |

#### 示例

```typescript
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 创建 QRCode 实例
const qr = new QRCodeWasm('https://github.com/veaba/wasm-qrcode', CorrectLevel.H);
```

### 静态方法

#### with_options

使用选项创建 QRCodeWasm 实例。

```typescript
static with_options(
  width: number,
  height: number,
  correct_level: CorrectLevel
): QRCodeWasm
```

##### 示例

```typescript
const qr = QRCodeWasm.with_options(256, 256, CorrectLevel.H);
qr.make_code('https://github.com/veaba/wasm-qrcode');
```

## 实例方法

### make_code

生成 QRCode。

```typescript
make_code(text: string): void
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 要编码的文本 |

#### 示例

```typescript
const qr = new QRCodeWasm();
qr.make_code('https://github.com/veaba/wasm-qrcode');
```

### get_svg

获取 SVG 字符串。

```typescript
get_svg(): string
```

#### 返回值

`string` - SVG XML 字符串

#### 示例

```typescript
const qr = new QRCodeWasm();
qr.make_code('https://github.com/veaba/wasm-qrcode');
const svg = qr.get_svg();
console.log(svg);
```

### toSVG

生成 SVG（统一接口）。

```typescript
toSVG(size?: number | null): string
```

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `size` | `number \| null` | 否 | SVG 尺寸 |

#### 示例

```typescript
const qr = new QRCodeWasm('https://github.com/veaba/wasm-qrcode', CorrectLevel.H);
const svg = qr.toSVG(256);
```

### toStyledSVG

生成带样式的 SVG。

```typescript
toStyledSVG(options: any): string
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `options` | `any` | 样式选项 |

#### 示例

```typescript
const qr = new QRCodeWasm('https://github.com/veaba/wasm-qrcode', CorrectLevel.H);
const svg = qr.toStyledSVG({
  size: 256,
  colorDark: '#000000',
  colorLight: '#ffffff',
  borderRadius: 8
});
```

### get_module_count

获取模块数量。

```typescript
get_module_count(): number
```

#### 返回值

`number` - 模块数量

### getModulesJSON

获取模块数据作为 JSON 字符串。

```typescript
getModulesJSON(): string
```

#### 返回值

`string` - JSON 格式的模块数据

### is_dark

判断指定位置是否为深色。

```typescript
is_dark(row: number, col: number): boolean
```

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `row` | `number` | 行索引 |
| `col` | `number` | 列索引 |

#### 返回值

`boolean` - true 表示深色

### free

释放 WASM 内存。

```typescript
free(): void
```

#### 说明

WASM 对象不会自动被垃圾回收，需要手动调用 `free()` 释放内存。或者使用 `using` 语法（TypeScript 5.2+）：

```typescript
{
  using qr = new QRCodeWasm('https://github.com/veaba/wasm-qrcode', CorrectLevel.H);
  const svg = qr.get_svg();
  // 离开作用域自动调用 free()
}
```

## QRCodeGenerator 类

可复用的 QRCode 生成器，性能更优。

### 构造函数

```typescript
constructor()
```

### 方法

#### set_options

```typescript
set_options(width: number, height: number, correct_level: CorrectLevel): void
```

#### generate

```typescript
generate(text: string): void
```

#### generate_batch

```typescript
generate_batch(texts: string[]): string[]
```

#### get_svg

```typescript
get_svg(): string
```

#### clear

```typescript
clear(): void
```

### 示例

```typescript
import init, { QRCodeGenerator, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

// 创建可复用生成器
const gen = new QRCodeGenerator();
gen.set_options(256, 256, CorrectLevel.H);

// 批量生成
const texts = ['url1', 'url2', 'url3'];
const svgs = gen.generate_batch(texts);

// 清理
gen.free();
```

## 预设样式函数

### 圆角 QRCode

```typescript
generateRoundedQRCode(text: string, size?: number, radius?: number): string
```

### 渐变 QRCode

```typescript
generateGradientQRCode(
  text: string,
  size: number | null | undefined,
  color1: string,
  color2: string
): string
```

### 微信风格

```typescript
generateWechatStyleQRCode(text: string, size?: number): string
```

### 抖音风格

```typescript
generateDouyinStyleQRCode(text: string, size?: number): string
```

### 支付宝风格

```typescript
generateAlipayStyleQRCode(text: string, size?: number): string
```

### 赛博朋克风格

```typescript
generateCyberpunkStyleQRCode(text: string, size?: number): string
```

## CanvasRenderer 类

用于 Canvas 渲染。

### 构造函数

```typescript
constructor(width: number, height: number)
```

### 方法

#### render

```typescript
render(text: string, correct_level: number): Uint8Array
```

#### set_colors

```typescript
set_colors(
  dark_r: number, dark_g: number, dark_b: number, dark_a: number,
  light_r: number, light_g: number, light_b: number, light_a: number
): void
```

### 示例

```typescript
import init, { CanvasRenderer, CorrectLevel } from '@veaba/qrcode-wasm';

await init();

const renderer = new CanvasRenderer(256, 256);
renderer.set_colors(0, 0, 0, 255, 255, 255, 255, 255);

const pixelData = renderer.render('https://github.com/veaba/wasm-qrcode', CorrectLevel.H);

// 使用 ImageData 显示
const imageData = new ImageData(
  new Uint8ClampedArray(pixelData),
  256,
  256
);
ctx.putImageData(imageData, 0, 0);
```

## CorrectLevel 枚举

```typescript
enum CorrectLevel {
  L = 1,  // ~7%
  M = 0,  // ~15%
  Q = 3,  // ~25%
  H = 2   // ~30%
}
```

## 完整示例

### React Hook

```typescript
import { useEffect, useState } from 'react';
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: string, size: number = 256) {
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      if (!initialized) {
        await init();
        initialized = true;
      }
      
      const qr = new QRCodeWasm(text, CorrectLevel.H);
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
import { ref, watch, onMounted } from 'vue';
import init, { QRCodeWasm, CorrectLevel } from '@veaba/qrcode-wasm';

let initialized = false;

export function useQRCode(text: Ref<string>) {
  const svg = ref('');

  const generate = async () => {
    if (!initialized) {
      await init();
      initialized = true;
    }
    
    const qr = new QRCodeWasm(text.value, CorrectLevel.H);
    svg.value = qr.get_svg();
  };

  onMounted(generate);
  watch(text, generate);

  return { svg };
}
```
