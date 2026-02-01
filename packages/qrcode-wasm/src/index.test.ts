/**
 * @veaba/qrcode-wasm - Unit Tests
 * Tests for WebAssembly QRCode library with unified API
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Note: These tests require the WASM module to be built first
// Run: npm run build:wasm
// Note: Functional tests that require WASM initialization are marked as skipped
// because WASM cannot be initialized in the test environment without a browser

describe('@veaba/qrcode-wasm - API Exports', () => {
  it('should export QRCodeCore', async () => {
    const mod = await import('./index.js');
    expect(mod.QRCodeCore).toBeDefined();
  });

  it('should export QRCode as alias', async () => {
    const mod = await import('./index.js');
    expect(mod.QRCode).toBeDefined();
  });

  it('should export QRErrorCorrectLevel', async () => {
    const mod = await import('./index.js');
    expect(mod.QRErrorCorrectLevel).toBeDefined();
    expect(mod.QRErrorCorrectLevel.L).toBe(1);
    expect(mod.QRErrorCorrectLevel.M).toBe(0);
    expect(mod.QRErrorCorrectLevel.Q).toBe(3);
    expect(mod.QRErrorCorrectLevel.H).toBe(2);
  });

  it('should export QRMode', async () => {
    const mod = await import('./index.js');
    expect(mod.QRMode).toBeDefined();
    expect(mod.QRMode.MODE_8BIT_BYTE).toBe(4);
  });

  it('should export style generators (CamelCase)', async () => {
    const mod = await import('./index.js');
    expect(mod.generateRoundedQRCode).toBeDefined();
    expect(mod.generateQRCodeWithLogoArea).toBeDefined();
    expect(mod.generateGradientQRCode).toBeDefined();
    expect(mod.generateWechatStyleQRCode).toBeDefined();
    expect(mod.generateDouyinStyleQRCode).toBeDefined();
    expect(mod.generateAlipayStyleQRCode).toBeDefined();
    expect(mod.generateXiaohongshuStyleQRCode).toBeDefined();
    expect(mod.generateCyberpunkStyleQRCode).toBeDefined();
    expect(mod.generateRetroStyleQRCode).toBeDefined();
    expect(mod.generateMinimalStyleQRCode).toBeDefined();
  });

  it('should export cached style generators', async () => {
    const mod = await import('./index.js');
    expect(mod.generateRoundedQRCodeCached).toBeDefined();
    expect(mod.generateQRCodeWithLogoAreaCached).toBeDefined();
    expect(mod.generateGradientQRCodeCached).toBeDefined();
    expect(mod.generateWechatStyleQRCodeCached).toBeDefined();
    expect(mod.generateDouyinStyleQRCodeCached).toBeDefined();
    expect(mod.generateAlipayStyleQRCodeCached).toBeDefined();
    expect(mod.generateXiaohongshuStyleQRCodeCached).toBeDefined();
    expect(mod.generateCyberpunkStyleQRCodeCached).toBeDefined();
    expect(mod.generateRetroStyleQRCodeCached).toBeDefined();
    expect(mod.generateMinimalStyleQRCodeCached).toBeDefined();
  });

  it('should export batch generators', async () => {
    const mod = await import('./index.js');
    expect(mod.generateBatchQRCodes).toBeDefined();
    expect(mod.generateBatchQRCodesCached).toBeDefined();
  });

  it('should export async generators', async () => {
    const mod = await import('./index.js');
    expect(mod.generateQRCodeAsync).toBeDefined();
    expect(mod.generateBatchAsync).toBeDefined();
  });

  it('should export cache management', async () => {
    const mod = await import('./index.js');
    expect(mod.getCachedQRCode).toBeDefined();
    expect(mod.clearQRCodeCache).toBeDefined();
    expect(mod.getCacheStats).toBeDefined();
    expect(mod.configureCache).toBeDefined();
  });

  it('should export WASM specific functions', async () => {
    const mod = await import('./index.js');
    expect(mod.init).toBeDefined();
    expect(mod.init_thread_pool).toBeDefined();
    expect(mod.is_parallel_supported).toBeDefined();
    expect(mod.QRCodeGenerator).toBeDefined();
    expect(mod.StyledQRCode).toBeDefined();
    expect(mod.QRCodeStyle).toBeDefined();
  });

  it('should export version info', async () => {
    const mod = await import('./index.js');
    expect(mod.VERSION).toBeDefined();
    expect(mod.getVersionInfo).toBeDefined();
  });

  it('should export default', async () => {
    const mod = await import('./index.js');
    expect(mod.default).toBeDefined();
  });
});

describe('@veaba/qrcode-wasm - API Consistency with qrcode-js', () => {
  it('should have same export names as qrcode-js', async () => {
    const wasmMod = await import('./index.js');
    const jsMod = await import('../../qrcode-js/src/index.js');

    // Core classes
    expect(wasmMod.QRCodeCore).toBeDefined();
    expect(wasmMod.QRCode).toBeDefined();
    expect(jsMod.QRCodeCore).toBeDefined();
    expect(jsMod.QRCode).toBeDefined();

    // Enums
    expect(wasmMod.QRErrorCorrectLevel).toBeDefined();
    expect(wasmMod.QRMode).toBeDefined();
    expect(jsMod.QRErrorCorrectLevel).toBeDefined();
    expect(jsMod.QRMode).toBeDefined();

    // Style generators
    const styleFns = [
      'generateRoundedQRCode',
      'generateQRCodeWithLogoArea',
      'generateGradientQRCode',
      'generateWechatStyleQRCode',
      'generateDouyinStyleQRCode',
      'generateAlipayStyleQRCode',
      'generateXiaohongshuStyleQRCode',
      'generateCyberpunkStyleQRCode',
      'generateRetroStyleQRCode',
      'generateMinimalStyleQRCode',
    ];

    for (const fn of styleFns) {
      expect(wasmMod[fn]).toBeDefined();
      expect(jsMod[fn]).toBeDefined();
    }

    // Cached versions
    const cachedFns = styleFns.map(fn => `${fn}Cached`);
    for (const fn of cachedFns) {
      expect(wasmMod[fn]).toBeDefined();
      expect(jsMod[fn]).toBeDefined();
    }

    // Batch/Async
    expect(wasmMod.generateBatchQRCodes).toBeDefined();
    expect(wasmMod.generateBatchQRCodesCached).toBeDefined();
    expect(wasmMod.generateQRCodeAsync).toBeDefined();
    expect(wasmMod.generateBatchAsync).toBeDefined();
    expect(jsMod.generateBatchQRCodes).toBeDefined();
    expect(jsMod.generateBatchQRCodesCached).toBeDefined();
    expect(jsMod.generateQRCodeAsync).toBeDefined();
    expect(jsMod.generateBatchAsync).toBeDefined();

    // Cache management
    expect(wasmMod.getCachedQRCode).toBeDefined();
    expect(wasmMod.clearQRCodeCache).toBeDefined();
    expect(wasmMod.getCacheStats).toBeDefined();
    expect(wasmMod.configureCache).toBeDefined();
    expect(jsMod.getCachedQRCode).toBeDefined();
    expect(jsMod.clearQRCodeCache).toBeDefined();
    expect(jsMod.getCacheStats).toBeDefined();
    expect(jsMod.configureCache).toBeDefined();
  });

  it('should have same QRErrorCorrectLevel values', async () => {
    const wasmMod = await import('./index.js');
    const jsMod = await import('../../qrcode-js/src/index.js');

    expect(wasmMod.QRErrorCorrectLevel.L).toBe(jsMod.QRErrorCorrectLevel.L);
    expect(wasmMod.QRErrorCorrectLevel.M).toBe(jsMod.QRErrorCorrectLevel.M);
    expect(wasmMod.QRErrorCorrectLevel.Q).toBe(jsMod.QRErrorCorrectLevel.Q);
    expect(wasmMod.QRErrorCorrectLevel.H).toBe(jsMod.QRErrorCorrectLevel.H);
  });

  it('should have same QRMode values', async () => {
    const wasmMod = await import('./index.js');
    const jsMod = await import('../../qrcode-js/src/index.js');

    expect(wasmMod.QRMode.MODE_8BIT_BYTE).toBe(jsMod.QRMode.MODE_8BIT_BYTE);
  });
});

describe('@veaba/qrcode-wasm - Cache System', () => {
  let mod: typeof import('./index.js');

  beforeEach(async () => {
    mod = await import('./index.js');
  });

  afterEach(() => {
    mod.clearQRCodeCache();
  });

  it('getCachedQRCode should be defined', () => {
    expect(mod.getCachedQRCode).toBeDefined();
  });

  it('clearQRCodeCache should be defined', () => {
    expect(mod.clearQRCodeCache).toBeDefined();
  });

  it('getCacheStats should be defined', () => {
    expect(mod.getCacheStats).toBeDefined();
  });

  it('configureCache should be defined', () => {
    expect(mod.configureCache).toBeDefined();
  });

  it('cache stats should return correct structure', () => {
    const stats = mod.getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats).toHaveProperty('keys');
    expect(Array.isArray(stats.keys)).toBe(true);
  });

  it('clearQRCodeCache should reset cache', () => {
    mod.clearQRCodeCache();
    const stats = mod.getCacheStats();
    expect(stats.size).toBe(0);
  });

  it('cache should be initially empty', () => {
    const stats = mod.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.keys).toHaveLength(0);
  });

  it('configureCache should accept options', () => {
    // Should not throw
    expect(() => {
      mod.configureCache({ maxSize: 50, enabled: true });
    }).not.toThrow();
  });
});

describe('@veaba/qrcode-wasm - WASM Specific Features', () => {
  it('should export init function for WASM initialization', async () => {
    const mod = await import('./index.js');
    expect(mod.init).toBeDefined();
    expect(typeof mod.init).toBe('function');
  });

  it('should export QRCodeGenerator class', async () => {
    const mod = await import('./index.js');
    expect(mod.QRCodeGenerator).toBeDefined();
  });

  it('should export StyledQRCode class', async () => {
    const mod = await import('./index.js');
    expect(mod.StyledQRCode).toBeDefined();
  });

  it('should export QRCodeStyle class', async () => {
    const mod = await import('./index.js');
    expect(mod.QRCodeStyle).toBeDefined();
  });

  it('should export thread pool functions', async () => {
    const mod = await import('./index.js');
    expect(mod.init_thread_pool).toBeDefined();
    expect(mod.is_parallel_supported).toBeDefined();
  });

  it('should export VERSION', async () => {
    const mod = await import('./index.js');
    expect(mod.VERSION).toBeDefined();
    expect(typeof mod.VERSION).toBe('string');
    expect(mod.VERSION).toBe('0.2.0');
  });

  it('should export getVersionInfo', async () => {
    const mod = await import('./index.js');
    expect(mod.getVersionInfo).toBeDefined();
    expect(typeof mod.getVersionInfo).toBe('function');
  });

  it('should export QRCodeWasm (low-level)', async () => {
    const mod = await import('./index.js');
    // QRCodeWasm is imported from pkg but not re-exported directly
    // It's wrapped by QRCodeCore
    expect(mod.QRCodeCore).toBeDefined();
  });
});

describe('@veaba/qrcode-wasm - Type Definitions', () => {
  it('should export types interfaces', async () => {
    const mod = await import('./index.js');
    // Types are compile-time only, but we can check that the module loads
    expect(mod).toBeDefined();
  });
});

describe('@veaba/qrcode-wasm - QRCodeCore Structure', () => {
  it('should have correct QRCodeCore class structure', async () => {
    const mod = await import('./index.js');
    const QRCodeCore = mod.QRCodeCore;
    
    // Check it's a constructor
    expect(typeof QRCodeCore).toBe('function');
    
    // Check prototype methods
    expect(typeof QRCodeCore.prototype.toSVG).toBe('function');
    expect(typeof QRCodeCore.prototype.toStyledSVG).toBe('function');
    expect(typeof QRCodeCore.prototype.getModuleCount).toBe('function');
    expect(typeof QRCodeCore.prototype.isDark).toBe('function');
  });

  it('should have moduleCount getter defined', async () => {
    const mod = await import('./index.js');
    const descriptor = Object.getOwnPropertyDescriptor(mod.QRCodeCore.prototype, 'moduleCount');
    expect(descriptor).toBeDefined();
    expect(typeof descriptor?.get).toBe('function');
  });
});

describe('@veaba/qrcode-wasm - Function Signatures', () => {
  it('should have correct style generator signatures', async () => {
    const mod = await import('./index.js');
    
    // All style generators should be functions
    expect(typeof mod.generateRoundedQRCode).toBe('function');
    expect(typeof mod.generateQRCodeWithLogoArea).toBe('function');
    expect(typeof mod.generateGradientQRCode).toBe('function');
    expect(typeof mod.generateWechatStyleQRCode).toBe('function');
    expect(typeof mod.generateDouyinStyleQRCode).toBe('function');
    expect(typeof mod.generateAlipayStyleQRCode).toBe('function');
    expect(typeof mod.generateXiaohongshuStyleQRCode).toBe('function');
    expect(typeof mod.generateCyberpunkStyleQRCode).toBe('function');
    expect(typeof mod.generateRetroStyleQRCode).toBe('function');
    expect(typeof mod.generateMinimalStyleQRCode).toBe('function');
  });

  it('should have correct cached style generator signatures', async () => {
    const mod = await import('./index.js');
    
    expect(typeof mod.generateRoundedQRCodeCached).toBe('function');
    expect(typeof mod.generateQRCodeWithLogoAreaCached).toBe('function');
    expect(typeof mod.generateGradientQRCodeCached).toBe('function');
    expect(typeof mod.generateWechatStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateDouyinStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateAlipayStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateXiaohongshuStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateCyberpunkStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateRetroStyleQRCodeCached).toBe('function');
    expect(typeof mod.generateMinimalStyleQRCodeCached).toBe('function');
  });

  it('should have correct batch/async function signatures', async () => {
    const mod = await import('./index.js');
    
    expect(typeof mod.generateBatchQRCodes).toBe('function');
    expect(typeof mod.generateBatchQRCodesCached).toBe('function');
    expect(typeof mod.generateQRCodeAsync).toBe('function');
    expect(typeof mod.generateBatchAsync).toBe('function');
  });

  it('should have correct cache management signatures', async () => {
    const mod = await import('./index.js');
    
    expect(typeof mod.getCachedQRCode).toBe('function');
    expect(typeof mod.clearQRCodeCache).toBe('function');
    expect(typeof mod.getCacheStats).toBe('function');
    expect(typeof mod.configureCache).toBe('function');
  });
});

describe('@veaba/qrcode-wasm - Default Export', () => {
  it('should export QRCodeCore as default', async () => {
    const mod = await import('./index.js');
    expect(mod.default).toBe(mod.QRCodeCore);
  });
});

// Note: Functional tests that require WASM initialization are skipped
// because they need a browser environment with proper WASM support
describe('@veaba/qrcode-wasm - Functional Tests (Requires WASM)', () => {
  it.skip('QRCodeCore should work after init', async () => {
    // This test requires WASM initialization
    // Would need to be run in a browser environment
  });

  it.skip('style generators should work after init', async () => {
    // This test requires WASM initialization
  });

  it.skip('cached functions should use cache', async () => {
    // This test requires WASM initialization
  });

  it.skip('batch generation should work', async () => {
    // This test requires WASM initialization
  });

  it.skip('async generation should work', async () => {
    // This test requires WASM initialization
  });
});
