# API Patterns for QRCode Packages

## Common API Structure

All QRCode packages should expose a consistent API:

### Core Function

```typescript
// Generate QRCode from text
function generate(text: string, options?: QRCodeOptions): QRCodeResult

// Options interface
interface QRCodeOptions {
  width?: number;           // QRCode width in pixels
  margin?: number;          // Quiet zone margin
  color?: string;           // Foreground color
  backgroundColor?: string; // Background color
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'svg' | 'png' | 'utf8';
}

// Result interface
interface QRCodeResult {
  toString(): string;       // String representation
  toSVG(): string;          // SVG output
  toDataURL(): string;      // Base64 data URL
  toBuffer(): Buffer;       // Binary buffer (Node/Bun)
}
```

## Package-Specific Variations

### Browser (qrcode-js, qrcode-wasm)

```typescript
// Browser-specific: canvas rendering
function toCanvas(canvas: HTMLCanvasElement): void;

// Browser-specific: image element
function toImage(img: HTMLImageElement): void;
```

### Node.js (qrcode-node)

```typescript
// Node-specific: file output
function toFile(path: string): Promise<void>;

// Node-specific: stream
function toStream(): ReadableStream;
```

### Bun (qrcode-bun)

```typescript
// Bun-specific: file output (sync)
function toFile(path: string): void;
```

### Rust (qrcode-rust, qrcode-fast)

```rust
// Rust API
pub fn generate(text: &str, options: &Options) -> Result<QRCode, Error>;
pub fn to_svg(&self) -> String;
pub fn to_png(&self) -> Vec<u8>;
```

## Error Handling

All packages should use consistent error types:

```typescript
enum QRCodeError {
  InvalidInput = 'Invalid input text',
  TooLong = 'Text too long for QRCode capacity',
  InvalidOption = 'Invalid option value',
  RenderError = 'Failed to render QRCode'
}
```

## Caching Strategy

The shared package implements caching:

```typescript
// Cache by text + options hash
const cache = new Map<string, QRCodeResult>();

// Options are normalized before hashing
function normalizeOptions(options: QRCodeOptions): string {
  return JSON.stringify({
    width: options.width ?? 256,
    margin: options.margin ?? 4,
    color: options.color ?? '#000000',
    backgroundColor: options.backgroundColor ?? '#ffffff',
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M'
  });
}
```
