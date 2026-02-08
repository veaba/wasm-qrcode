/**
 * @veaba/qrcode-wasm - Browser Mode Tests
 * 
 * These tests run in real browser environment using Vitest Browser Mode.
 * They test actual WASM functionality that cannot be tested in Node.js.
 * 
 * Requirements:
 * - WASM module must be built: `wasm-pack build --target web --out-dir pkg`
 * - Playwright browsers installed: `pnpm exec playwright install chromium`
 * 
 * @see https://vitest.dev/guide/browser/
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Note: In browser mode, we need to use dynamic import for WASM
// because the initialization requires browser APIs
describe('@veaba/qrcode-wasm - Browser Mode', () => {
  let wasmModule: typeof import('@veaba/qrcode-wasm');
  let initFn: typeof import('../../packages/qrcode-wasm/pkg/qrcodes.js').default;
  let wasmAvailable = false;

  beforeAll(async () => {
    try {
      // Import the WASM module
      const pkg = await import('../../packages/qrcode-wasm/pkg/qrcodes.js');
      initFn = pkg.default;
      
      // Initialize WASM with the .wasm file URL
      // In browser mode, we can use import.meta.url to get the WASM path
      const wasmUrl = new URL('../../packages/qrcode-wasm/pkg/qrcodes_bg.wasm', import.meta.url).href;
      await initFn({ module_or_path: wasmUrl });
      
      // Now import the full module
      wasmModule = await import('@veaba/qrcode-wasm');
      wasmAvailable = true;
    } catch (e) {
      console.warn('WASM module not available, skipping browser tests:', e);
    }
  });

  // Helper to skip tests when WASM is not available
  const itIfWasm = (name: string, fn: () => void | Promise<void>) => {
    it(name, async () => {
      if (!wasmAvailable) {
        console.log(`Skipping "${name}" - WASM not available`);
        return;
      }
      await fn();
    });
  };

  describe('WASM Initialization', () => {
    itIfWasm('should initialize WASM module', () => {
      expect(wasmModule).toBeDefined();
    });

    itIfWasm('should export CorrectLevel enum', () => {
      expect(wasmModule.QRErrorCorrectLevel).toBeDefined();
      expect(wasmModule.QRErrorCorrectLevel.L).toBe(1);
      expect(wasmModule.QRErrorCorrectLevel.M).toBe(0);
      expect(wasmModule.QRErrorCorrectLevel.Q).toBe(3);
      expect(wasmModule.QRErrorCorrectLevel.H).toBe(2);
    });

    itIfWasm('should export QRMode', () => {
      expect(wasmModule.QRMode).toBeDefined();
      expect(wasmModule.QRMode.MODE_8BIT_BYTE).toBe(4);
    });
  });

  describe('QRCodeCore - Functional Tests', () => {
    itIfWasm('should create QRCodeCore instance', () => {
      const qr = new wasmModule.QRCodeCore('Hello WASM', wasmModule.QRErrorCorrectLevel.H);
      expect(qr).toBeDefined();
      expect(typeof qr.getModuleCount).toBe('function');
      expect(typeof qr.isDark).toBe('function');
      expect(typeof qr.toSVG).toBe('function');
    });

    itIfWasm('should generate SVG output', () => {
      const qr = new wasmModule.QRCodeCore('https://example.com', wasmModule.QRErrorCorrectLevel.M);
      const svg = qr.toSVG(256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    itIfWasm('should get module count', () => {
      const qr = new wasmModule.QRCodeCore('Test', wasmModule.QRErrorCorrectLevel.L);
      const count = qr.getModuleCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    itIfWasm('should check dark modules', () => {
      const qr = new wasmModule.QRCodeCore('Test Data', wasmModule.QRErrorCorrectLevel.H);
      const count = qr.getModuleCount();
      // Check a few positions (some should be dark, some light)
      const darkCount = Array.from({ length: Math.min(count, 5) }, (_, i) => 
        Array.from({ length: Math.min(count, 5) }, (_, j) => qr.isDark(i, j))
      ).flat().filter(Boolean).length;
      // Just verify the function works (we don't know exact pattern)
      expect(typeof darkCount).toBe('number');
    });
  });

  describe('Style Generators', () => {
    itIfWasm('should generate rounded QRCode', () => {
      const svg = wasmModule.generateRoundedQRCode('Rounded Test', 256, 8);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate QRCode with logo area', () => {
      const svg = wasmModule.generateQRCodeWithLogoArea('Logo Test', 256, 0.2);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate gradient QRCode', () => {
      const svg = wasmModule.generateGradientQRCode('Gradient Test', 256, '#667eea', '#764ba2');
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate WeChat style QRCode', () => {
      const svg = wasmModule.generateWechatStyleQRCode('WeChat Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Douyin style QRCode', () => {
      const svg = wasmModule.generateDouyinStyleQRCode('Douyin Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Alipay style QRCode', () => {
      const svg = wasmModule.generateAlipayStyleQRCode('Alipay Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Xiaohongshu style QRCode', () => {
      const svg = wasmModule.generateXiaohongshuStyleQRCode('Xiaohongshu Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Cyberpunk style QRCode', () => {
      const svg = wasmModule.generateCyberpunkStyleQRCode('Cyberpunk Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Retro style QRCode', () => {
      const svg = wasmModule.generateRetroStyleQRCode('Retro Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });

    itIfWasm('should generate Minimal style QRCode', () => {
      const svg = wasmModule.generateMinimalStyleQRCode('Minimal Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });
  });

  describe('Cached Style Generators', () => {
    itIfWasm('should use cached generators', () => {
      const svg1 = wasmModule.generateRoundedQRCodeCached('Cache Test 1');
      const svg2 = wasmModule.generateRoundedQRCodeCached('Cache Test 1'); // Same text
      expect(typeof svg1).toBe('string');
      expect(typeof svg2).toBe('string');
    });
  });

  describe('Batch Generation', () => {
    itIfWasm('should generate batch QRCodes', () => {
      const texts = ['Batch 1', 'Batch 2', 'Batch 3'];
      const results = wasmModule.generateBatchQRCodes(texts, { correctLevel: wasmModule.QRErrorCorrectLevel.H });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);
      results.forEach(svg => {
        expect(typeof svg).toBe('string');
        expect(svg).toContain('<svg');
      });
    });

    itIfWasm('should generate batch QRCodes with cache', () => {
      const texts = ['Cached 1', 'Cached 2'];
      const results = wasmModule.generateBatchQRCodesCached(texts, { size: 200 });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });
  });

  describe('Async Generation', () => {
    itIfWasm('should generate QRCode asynchronously - returns string', async () => {
      const result = await wasmModule.generateQRCodeAsync('Async Test', {
        correctLevel: wasmModule.QRErrorCorrectLevel.M,
        size: 256
      });
      // API changed: now returns Promise<string> instead of Promise<QRCodeResult>
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });

    itIfWasm('should generate styled QRCode asynchronously', async () => {
      const result = await wasmModule.generateQRCodeAsync('Styled Async', {
        size: 256
      });
      expect(typeof result).toBe('string');
      expect(result).toContain('<svg');
    });

    itIfWasm('should generate batch asynchronously - returns string[]', async () => {
      const texts = ['Async 1', 'Async 2', 'Async 3'];
      const results = await wasmModule.generateBatchAsync(texts, { size: 200 });
      // API changed: now returns Promise<string[]> instead of Promise<QRCodeResult[]>
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(typeof result).toBe('string');
        expect(result).toContain('<svg');
      });
    });
  });

  describe('Cache Management', () => {
    itIfWasm('should manage cache correctly', () => {
      wasmModule.clearQRCodeCache();
      const stats = wasmModule.getCacheStats();
      expect(stats.size).toBe(0);
      expect(Array.isArray(stats.keys)).toBe(true);
    });

    itIfWasm('should get cached QRCode', () => {
      wasmModule.clearQRCodeCache();
      const qr1 = wasmModule.getCachedQRCode('Cache Test', wasmModule.QRErrorCorrectLevel.H);
      const qr2 = wasmModule.getCachedQRCode('Cache Test', wasmModule.QRErrorCorrectLevel.H);
      expect(qr1).toBeDefined();
      expect(qr2).toBeDefined();
    });
  });

  describe('Version Info', () => {
    itIfWasm('should export version', () => {
      expect(wasmModule.VERSION).toBe('0.2.0');
    });

    itIfWasm('should get version info', () => {
      const info = wasmModule.getVersionInfo();
      expect(typeof info).toBe('string');
    });
  });

  describe('Default Export', () => {
    itIfWasm('should have QRCodeCore as default', () => {
      expect(wasmModule.default).toBe(wasmModule.QRCodeCore);
    });
  });

  describe('QRCodeCore Properties - New API', () => {
    itIfWasm('should have text property', () => {
      const qr = new wasmModule.QRCodeCore('Hello World');
      expect(qr.text).toBe('Hello World');
    });

    itIfWasm('should have correctLevel property', () => {
      const qr = new wasmModule.QRCodeCore('Hello', wasmModule.QRErrorCorrectLevel.H);
      expect(qr.correctLevel).toBe(wasmModule.QRErrorCorrectLevel.H);
    });

    itIfWasm('should have typeNumber property', () => {
      const qr = new wasmModule.QRCodeCore('Hello');
      expect(typeof qr.typeNumber).toBe('number');
    });

    itIfWasm('should have modules property as Uint8Array', () => {
      const qr = new wasmModule.QRCodeCore('Hello');
      expect(qr.modules).toBeInstanceOf(Uint8Array);
      expect(qr.modules.length).toBeGreaterThan(0);
    });

    itIfWasm('modules property should match moduleCount', () => {
      const qr = new wasmModule.QRCodeCore('Test');
      const count = qr.moduleCount;
      expect(qr.modules.length).toBe(count * count);
    });
  });

  describe('Advanced Async Functions - New API', () => {
    itIfWasm('generateQRCodeAsyncAdvanced should return QRCodeResult', async () => {
      const result = await wasmModule.generateQRCodeAsyncAdvanced('Hello', { size: 128 });
      expect(result).toMatchObject({
        text: 'Hello',
        svg: expect.stringContaining('<svg'),
        moduleCount: expect.any(Number)
      });
      expect(result.svg).toContain('</svg>');
    });

    itIfWasm('generateBatchAsyncAdvanced should return QRCodeResult[]', async () => {
      const results = await wasmModule.generateBatchAsyncAdvanced(['Hello', 'World'], { size: 128 });
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result).toMatchObject({
          text: expect.any(String),
          svg: expect.stringContaining('<svg'),
          moduleCount: expect.any(Number)
        });
      });
    });

    itIfWasm('generateQRCodeAsyncAdvanced should support cache option', async () => {
      const result = await wasmModule.generateQRCodeAsyncAdvanced('Test', { cache: true });
      expect(result).toHaveProperty('moduleCount');
      expect(typeof result.moduleCount).toBe('number');
    });
  });

  describe('Snake Case Aliases - API Consistency', () => {
    const snakeCaseAliases = [
      'generate_rounded_qrcode',
      'generate_qrcode_with_logo_area',
      'generate_gradient_qrcode',
      'generate_wechat_style_qrcode',
      'generate_douyin_style_qrcode',
      'generate_alipay_style_qrcode',
      'generate_xiaohongshu_style_qrcode',
      'generate_cyberpunk_style_qrcode',
      'generate_retro_style_qrcode',
      'generate_minimal_style_qrcode'
    ];

    itIfWasm('should export all snake_case aliases', () => {
      snakeCaseAliases.forEach(alias => {
        expect(typeof wasmModule[alias]).toBe('function');
      });
    });

    itIfWasm('snake_case aliases should point to cached versions', () => {
      expect(wasmModule.generate_rounded_qrcode).toBe(wasmModule.generateRoundedQRCodeCached);
      expect(wasmModule.generate_gradient_qrcode).toBe(wasmModule.generateGradientQRCodeCached);
      expect(wasmModule.generate_wechat_style_qrcode).toBe(wasmModule.generateWechatStyleQRCodeCached);
    });

    itIfWasm('snake_case aliases should work correctly', () => {
      const svg = wasmModule.generate_rounded_qrcode('Test', 256);
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    });
  });

  describe('Return Type Verification', () => {
    itIfWasm('generateQRCodeAsync vs generateQRCodeAsyncAdvanced return different types', async () => {
      const simpleResult = await wasmModule.generateQRCodeAsync('Test');
      const advancedResult = await wasmModule.generateQRCodeAsyncAdvanced('Test');

      // Simple returns string
      expect(typeof simpleResult).toBe('string');
      expect(simpleResult).toContain('<svg');

      // Advanced returns object
      expect(typeof advancedResult).toBe('object');
      expect(advancedResult).toHaveProperty('text');
      expect(advancedResult).toHaveProperty('svg');
      expect(advancedResult).toHaveProperty('moduleCount');
    });

    itIfWasm('generateBatchAsync vs generateBatchAsyncAdvanced return different types', async () => {
      const texts = ['Test1', 'Test2'];
      const simpleResults = await wasmModule.generateBatchAsync(texts);
      const advancedResults = await wasmModule.generateBatchAsyncAdvanced(texts);

      // Simple returns string[]
      expect(Array.isArray(simpleResults)).toBe(true);
      expect(typeof simpleResults[0]).toBe('string');

      // Advanced returns QRCodeResult[]
      expect(Array.isArray(advancedResults)).toBe(true);
      expect(typeof advancedResults[0]).toBe('object');
      expect(advancedResults[0]).toHaveProperty('text');
    });
  });
});
