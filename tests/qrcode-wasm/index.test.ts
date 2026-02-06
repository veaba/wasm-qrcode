/**
 * @veaba/qrcode-wasm - Unit Tests
 * Tests for WebAssembly QRCode library with unified API
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Note: These tests require the WASM module to be built first
// Run: npm run build:wasm

describe('@veaba/qrcode-wasm', () => {
  let mod: typeof import('@veaba/qrcode-wasm');
  let jsMod: typeof import('@veaba/qrcode-js');

  beforeAll(async () => {
    mod = await import('@veaba/qrcode-wasm');
    jsMod = await import('@veaba/qrcode-js');
  });

  describe('API Exports', () => {
    const styleFns = [
      'generateRoundedQRCode', 'generateQRCodeWithLogoArea', 'generateGradientQRCode',
      'generateWechatStyleQRCode', 'generateDouyinStyleQRCode', 'generateAlipayStyleQRCode',
      'generateXiaohongshuStyleQRCode', 'generateCyberpunkStyleQRCode', 'generateRetroStyleQRCode',
      'generateMinimalStyleQRCode'
    ];

    it('should export core classes and enums', () => {
      expect(mod.QRCodeCore).toBeDefined();
      expect(mod.QRCode).toBe(mod.QRCodeCore);
      expect(mod.QRErrorCorrectLevel).toMatchObject({ L: 1, M: 0, Q: 3, H: 2 });
      expect(mod.QRMode).toMatchObject({ MODE_8BIT_BYTE: 4 });
    });

    it.each(styleFns)('should export %s', (fn) => {
      expect(typeof (mod as Record<string, unknown>)[fn]).toBe('function');
      expect(typeof (mod as Record<string, unknown>)[`${fn}Cached`]).toBe('function');
    });

    it('should export batch/async functions', () => {
      ['generateBatchQRCodes', 'generateBatchQRCodesCached', 'generateQRCodeAsync', 'generateBatchAsync']
        .forEach(fn => expect(typeof (mod as Record<string, unknown>)[fn]).toBe('function'));
    });

    it('should export cache management', () => {
      ['getCachedQRCode', 'clearQRCodeCache', 'getCacheStats', 'configureCache']
        .forEach(fn => expect(typeof (mod as Record<string, unknown>)[fn]).toBe('function'));
    });

    it('should export WASM specific features', () => {
      expect(typeof mod.init).toBe('function');
      expect(typeof mod.init_thread_pool).toBe('function');
      expect(mod.QRCodeGenerator).toBeDefined();
      expect(mod.StyledQRCode).toBeDefined();
    });

    it('should export version info', () => {
      expect(mod.VERSION).toBe('0.2.0');
      expect(typeof mod.getVersionInfo).toBe('function');
    });

    it('should export default as QRCodeCore', () => {
      expect(mod.default).toBe(mod.QRCodeCore);
    });
  });

  describe('API Consistency with qrcode-js', () => {
    it('should have matching exports', () => {
      const exports = ['QRCodeCore', 'QRCode', 'QRErrorCorrectLevel', 'QRMode'];
      exports.forEach(exp => {
        expect((mod as Record<string, unknown>)[exp]).toBeDefined();
        expect((jsMod as Record<string, unknown>)[exp]).toBeDefined();
      });
    });

    it('should have same enum values', () => {
      expect(mod.QRErrorCorrectLevel).toEqual(jsMod.QRErrorCorrectLevel);
    });
  });

  describe('Cache System', () => {
    it('should manage cache correctly', () => {
      mod.clearQRCodeCache();
      const stats = mod.getCacheStats();
      expect(stats).toMatchObject({ size: 0, keys: [] });
      expect(Array.isArray(stats.keys)).toBe(true);
      expect(() => mod.configureCache({ maxSize: 50 })).not.toThrow();
    });
  });

  describe('QRCodeCore Structure', () => {
    it('should have correct prototype', () => {
      expect(typeof mod.QRCodeCore).toBe('function');
      ['toSVG', 'toStyledSVG', 'getModuleCount', 'isDark'].forEach(
        method => expect(typeof mod.QRCodeCore.prototype[method]).toBe('function')
      );
      expect(Object.getOwnPropertyDescriptor(mod.QRCodeCore.prototype, 'moduleCount')?.get).toBeDefined();
    });
  });

  // Functional tests require browser environment with WASM
  describe('Functional Tests (Requires WASM)', () => {
    it.skip('should work after init', () => {});
    it.skip('should generate QR codes', () => {});
    it.skip('should use cache', () => {});
  });
});
