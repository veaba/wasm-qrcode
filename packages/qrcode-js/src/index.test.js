/**
 * @veaba/qrcode-js - Unit Tests
 * Tests for browser-compatible QRCode library
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('@veaba/qrcode-js - Re-exports from @veaba/qrcode-shared', () => {
  // Note: @veaba/qrcode-js re-exports everything from @veaba/qrcode-shared
  // These tests verify the re-exports work correctly

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
    expect(mod.QRErrorCorrectLevel.H).toBe(2);
  });

  it('should export QRMode', async () => {
    const mod = await import('./index.js');
    expect(mod.QRMode).toBeDefined();
    expect(mod.QRMode.MODE_8BIT_BYTE).toBe(4);
  });

  it('should export style generators', async () => {
    const mod = await import('./index.js');
    expect(mod.generateRoundedQRCode).toBeDefined();
    expect(mod.generateQRCodeWithLogoArea).toBeDefined();
    expect(mod.generateGradientQRCode).toBeDefined();
  });

  it('should export platform style generators', async () => {
    const mod = await import('./index.js');
    expect(mod.generateWechatStyleQRCode).toBeDefined();
    expect(mod.generateDouyinStyleQRCode).toBeDefined();
    expect(mod.generateAlipayStyleQRCode).toBeDefined();
    expect(mod.generateXiaohongshuStyleQRCode).toBeDefined();
    expect(mod.generateCyberpunkStyleQRCode).toBeDefined();
    expect(mod.generateRetroStyleQRCode).toBeDefined();
    expect(mod.generateMinimalStyleQRCode).toBeDefined();
  });

  it('should export cached versions', async () => {
    const mod = await import('./index.js');
    expect(mod.generateRoundedQRCodeCached).toBeDefined();
    expect(mod.generateQRCodeWithLogoAreaCached).toBeDefined();
    expect(mod.generateGradientQRCodeCached).toBeDefined();
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

  it('should export utility classes', async () => {
    const mod = await import('./index.js');
    expect(mod.QRMath).toBeDefined();
    expect(mod.Polynomial).toBeDefined();
    expect(mod.BitBuffer).toBeDefined();
  });

  it('should export constants', async () => {
    const mod = await import('./index.js');
    expect(mod.PATTERN_POSITION_TABLE).toBeDefined();
    expect(mod.QRCodeLimitLength).toBeDefined();
    expect(mod.RS_BLOCK_TABLE).toBeDefined();
  });

  it('should export utility functions', async () => {
    const mod = await import('./index.js');
    expect(mod.getErrorCorrectPolynomial).toBeDefined();
    expect(mod.getRSBlocks).toBeDefined();
    expect(mod.getTypeNumber).toBeDefined();
  });

  it('should export snake_case aliases', async () => {
    const mod = await import('./index.js');
    expect(mod.generate_rounded_qrcode).toBeDefined();
    expect(mod.generate_qrcode_with_logo_area).toBeDefined();
    expect(mod.generate_gradient_qrcode).toBeDefined();
  });

  it('should export version info', async () => {
    const mod = await import('./index.js');
    expect(mod.VERSION).toBeDefined();
    expect(mod.getVersionInfo).toBeDefined();
  });
});

describe('@veaba/qrcode-js - Functional Tests', () => {
  let mod;

  beforeEach(async () => {
    mod = await import('./index.js');
  });

  afterEach(() => {
    mod.clearQRCodeCache();
  });

  it('should generate basic QRCode', () => {
    const qr = new mod.QRCodeCore('test');
    expect(qr.text).toBe('test');
    expect(qr.moduleCount).toBeGreaterThan(0);
  });

  it('should generate SVG', () => {
    const qr = new mod.QRCodeCore('test');
    const svg = qr.toSVG(256);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('generateRoundedQRCode should work', () => {
    const svg = mod.generateRoundedQRCode('test', 256, 8);
    expect(svg).toContain('<svg');
  });

  it('generateWechatStyleQRCode should work', () => {
    const svg = mod.generateWechatStyleQRCode('test', 256);
    expect(svg).toContain('#07C160');
  });

  it('generateBatchQRCodes should work', () => {
    const svgs = mod.generateBatchQRCodes(['test1', 'test2']);
    expect(svgs).toHaveLength(2);
  });

  it('generateQRCodeAsync should work', async () => {
    const svg = await mod.generateQRCodeAsync('test');
    expect(svg).toContain('<svg');
  });

  it('cache should work', () => {
    const qr1 = mod.getCachedQRCode('test');
    const qr2 = mod.getCachedQRCode('test');
    expect(qr1).toBe(qr2);
  });

  it('clearQRCodeCache should work', () => {
    mod.getCachedQRCode('test');
    mod.clearQRCodeCache();
    const stats = mod.getCacheStats();
    expect(stats.size).toBe(0);
  });

  it('getVersionInfo should return valid info', () => {
    const info = mod.getVersionInfo();
    expect(typeof info).toBe('string');
    const parsed = JSON.parse(info);
    expect(parsed.version).toBeDefined();
    expect(parsed.name).toBe('@veaba/qrcode-shared');
  });
});

describe('@veaba/qrcode-js - Browser Compatibility', () => {
  it('should work in browser-like environment', async () => {
    const mod = await import('./index.js');
    const qr = new mod.QRCodeCore('browser test');
    expect(qr.toSVG()).toContain('<svg');
  });

  it('should handle canvas-free SVG generation', async () => {
    const mod = await import('./index.js');
    const svg = mod.generateRoundedQRCode('test', 256);
    expect(svg).not.toContain('<canvas');
  });
});
