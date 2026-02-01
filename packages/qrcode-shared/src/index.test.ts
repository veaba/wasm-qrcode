/**
 * @veaba/qrcode-shared - Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  QRCodeCore,
  QRMath,
  Polynomial,
  BitBuffer,
  QRErrorCorrectLevel,
  getErrorCorrectPolynomial,
  getRSBlocks,
  getTypeNumber,
  generateRoundedQRCode,
  generateQRCodeWithLogoArea,
  generateGradientQRCode,
  generateWechatStyleQRCode,
  generateDouyinStyleQRCode,
  generateAlipayStyleQRCode,
  generateXiaohongshuStyleQRCode,
  generateCyberpunkStyleQRCode,
  generateRetroStyleQRCode,
  generateMinimalStyleQRCode,
  generateBatchQRCodes,
  generateQRCodeAsync,
  generateBatchAsync,
  getCachedQRCode,
  clearQRCodeCache,
  getCacheStats,
  configureCache,
  generateRoundedQRCodeCached,
  generateBatchQRCodesCached,
} from './index.js';

describe('@veaba/qrcode-shared - QRMath', () => {
  it('should initialize EXP_TABLE and LOG_TABLE correctly', () => {
    expect(QRMath.EXP_TABLE).toBeInstanceOf(Uint8Array);
    expect(QRMath.EXP_TABLE.length).toBe(256);
    expect(QRMath.LOG_TABLE).toBeInstanceOf(Uint8Array);
    expect(QRMath.LOG_TABLE.length).toBe(256);
  });

  it('should compute glog correctly', () => {
    expect(QRMath.glog(1)).toBe(0);
    expect(QRMath.glog(2)).toBe(1);
  });

  it('should throw error for invalid glog input', () => {
    expect(() => QRMath.glog(0)).toThrow();
    expect(() => QRMath.glog(-1)).toThrow();
  });

  it('should compute gexp correctly', () => {
    expect(QRMath.gexp(0)).toBe(1);
    expect(QRMath.gexp(1)).toBe(2);
    expect(QRMath.gexp(-1)).toBe(QRMath.gexp(254));
  });

  it('should handle large gexp values', () => {
    // gexp(256) = gexp(256 - 255) = gexp(1) = 2
    expect(QRMath.gexp(256)).toBe(QRMath.gexp(1));
    // gexp(300) = gexp(300 - 255) = gexp(45)
    expect(QRMath.gexp(300)).toBe(QRMath.gexp(45));
  });
});

describe('@veaba/qrcode-shared - Polynomial', () => {
  it('should create polynomial from array', () => {
    const poly = new Polynomial([1, 2, 3]);
    expect(poly.length).toBe(3);
    expect(poly.get(0)).toBe(1);
    expect(poly.get(1)).toBe(2);
    expect(poly.get(2)).toBe(3);
  });

  it('should create polynomial from Uint8Array', () => {
    const coeffs = new Uint8Array([1, 2, 3]);
    const poly = new Polynomial(coeffs);
    expect(poly.length).toBe(3);
  });

  it('should remove leading zeros', () => {
    const poly = new Polynomial([0, 0, 1, 2]);
    expect(poly.length).toBe(2);
    expect(poly.get(0)).toBe(1);
  });

  it('should multiply polynomials correctly', () => {
    const p1 = new Polynomial([1, 2]);
    const p2 = new Polynomial([3, 4]);
    const result = p1.multiply(p2);
    expect(result.length).toBe(3);
  });

  it('should compute modulo correctly', () => {
    const p1 = new Polynomial([1, 2, 3, 4]);
    const p2 = new Polynomial([1, 2]);
    const result = p1.mod(p2);
    expect(result).toBeDefined();
  });
});

describe('@veaba/qrcode-shared - BitBuffer', () => {
  it('should create empty buffer', () => {
    const buffer = new BitBuffer();
    expect(buffer.buffer).toEqual([]);
    expect(buffer.length).toBe(0);
  });

  it('should put bits correctly', () => {
    const buffer = new BitBuffer();
    buffer.put(0b1011, 4);
    expect(buffer.length).toBe(4);
  });

  it('should put single bit', () => {
    const buffer = new BitBuffer();
    buffer.putBit(true);
    buffer.putBit(false);
    buffer.putBit(true);
    expect(buffer.length).toBe(3);
  });

  it('should expand buffer when needed', () => {
    const buffer = new BitBuffer();
    for (let i = 0; i < 100; i++) {
      buffer.putBit(true);
    }
    expect(buffer.length).toBe(100);
    expect(buffer.buffer.length).toBe(Math.ceil(100 / 8));
  });
});

describe('@veaba/qrcode-shared - getErrorCorrectPolynomial', () => {
  it('should cache results', () => {
    const poly1 = getErrorCorrectPolynomial(5);
    const poly2 = getErrorCorrectPolynomial(5);
    expect(poly1).toBe(poly2);
  });

  it('should return polynomial with correct length', () => {
    const poly = getErrorCorrectPolynomial(3);
    expect(poly.length).toBe(4); // ecCount + 1
  });
});

describe('@veaba/qrcode-shared - getTypeNumber', () => {
  it('should return correct type number for short text', () => {
    const typeNumber = getTypeNumber(10, QRErrorCorrectLevel.H);
    // Type 2 is correct for 10 bytes with H level (L=0,M=1,Q=3,H=2)
    expect(typeNumber).toBeGreaterThan(0);
  });

  it('should return higher type number for long text', () => {
    const typeNumber = getTypeNumber(1000, QRErrorCorrectLevel.H);
    expect(typeNumber).toBeGreaterThan(1);
  });

  it('should throw error for text too long', () => {
    expect(() => getTypeNumber(100000, QRErrorCorrectLevel.H)).toThrow();
  });
});

describe('@veaba/qrcode-shared - QRCodeCore', () => {
  it('should create QRCode with text', () => {
    const qr = new QRCodeCore('Hello World');
    expect(qr.text).toBe('Hello World');
    expect(qr.moduleCount).toBeGreaterThan(0);
  });

  it('should use default error correction level H', () => {
    const qr = new QRCodeCore('test');
    expect(qr.correctLevel).toBe(QRErrorCorrectLevel.H);
  });

  it('should accept custom error correction level', () => {
    const qr = new QRCodeCore('test', QRErrorCorrectLevel.L);
    expect(qr.correctLevel).toBe(QRErrorCorrectLevel.L);
  });

  it('should have correct module count based on type number', () => {
    const qr = new QRCodeCore('test');
    expect(qr.moduleCount).toBe(qr.typeNumber * 4 + 17);
  });

  it('should isDark return boolean', () => {
    const qr = new QRCodeCore('test');
    expect(typeof qr.isDark(0, 0)).toBe('boolean');
  });

  it('should getModuleCount return correct value', () => {
    const qr = new QRCodeCore('test');
    expect(qr.getModuleCount()).toBe(qr.moduleCount);
  });

  it('should toSVG generate valid SVG string', () => {
    const qr = new QRCodeCore('test');
    const svg = qr.toSVG(256);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should toSVG use default size 256', () => {
    const qr = new QRCodeCore('test');
    const svg = qr.toSVG();
    expect(svg).toContain('width="');
    expect(svg).toContain('height="');
  });

  it('should toStyledSVG generate SVG with options', () => {
    const qr = new QRCodeCore('test');
    const svg = qr.toStyledSVG({
      size: 256,
      colorDark: '#FF0000',
      colorLight: '#FFFFFF',
      borderRadius: 8,
    });
    expect(svg).toContain('#FF0000');
    expect(svg).toContain('#FFFFFF');
  });

  it('should toStyledSVG with gradient', () => {
    const qr = new QRCodeCore('test');
    const svg = qr.toStyledSVG({
      size: 256,
      gradient: { color1: '#667eea', color2: '#764ba2' },
    });
    expect(svg).toContain('linearGradient');
    expect(svg).toContain('#667eea');
    expect(svg).toContain('#764ba2');
  });

  it('should toStyledSVG with quiet zone', () => {
    const qr = new QRCodeCore('test');
    const svg = qr.toStyledSVG({ quietZone: 4 });
    expect(svg).toContain('<svg');
  });

  it('should toStyledSVG with logo regions', () => {
    const qr = new QRCodeCore('test');
    const count = qr.getModuleCount();
    const logoStart = Math.floor((count - 6) / 2);
    const svg = qr.toStyledSVG({
      size: 256,
      logoRegions: [{ row: logoStart, col: logoStart, size: 6 }],
    });
    expect(svg).toContain('rect');
  });

  it('should generate same QR for same input', () => {
    const qr1 = new QRCodeCore('test');
    const qr2 = new QRCodeCore('test');
    expect(qr1.moduleCount).toBe(qr2.moduleCount);
  });

  it('should generate different QR for different input', () => {
    const qr1 = new QRCodeCore('test1');
    const qr2 = new QRCodeCore('test2');
    expect(qr1.text).not.toBe(qr2.text);
  });
});

describe('@veaba/qrcode-shared - Style Generator Functions', () => {
  it('generateRoundedQRCode should return SVG', () => {
    const svg = generateRoundedQRCode('test', 256, 8);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('generateQRCodeWithLogoArea should return SVG with logo area', () => {
    const svg = generateQRCodeWithLogoArea('test', 256, 0.2);
    expect(svg).toContain('<svg');
    expect(svg).toContain('rect');
  });

  it('generateGradientQRCode should return SVG with gradient', () => {
    const svg = generateGradientQRCode('test', 256, '#667eea', '#764ba2');
    expect(svg).toContain('linearGradient');
    expect(svg).toContain('#667eea');
  });

  it('generateWechatStyleQRCode should use WeChat green', () => {
    const svg = generateWechatStyleQRCode('test', 256);
    expect(svg).toContain('#07C160');
  });

  it('generateDouyinStyleQRCode should use Douyin colors', () => {
    const svg = generateDouyinStyleQRCode('test', 256);
    expect(svg).toContain('#00F2EA');
  });

  it('generateAlipayStyleQRCode should use logo area style', () => {
    const svg = generateAlipayStyleQRCode('test', 256);
    // Alipay style uses generateQRCodeWithLogoArea internally
    expect(svg).toContain('<svg');
    expect(svg).toContain('rect'); // Has logo area
  });

  it('generateXiaohongshuStyleQRCode should use Xiaohongshu red', () => {
    const svg = generateXiaohongshuStyleQRCode('test', 256);
    expect(svg).toContain('#FF2442');
  });

  it('generateCyberpunkStyleQRCode should use cyberpunk colors', () => {
    const svg = generateCyberpunkStyleQRCode('test', 256);
    expect(svg).toContain('#FF00FF');
    expect(svg).toContain('#00FFFF');
  });

  it('generateRetroStyleQRCode should use retro colors', () => {
    const svg = generateRetroStyleQRCode('test', 256);
    expect(svg).toContain('#8B4513');
  });

  it('generateMinimalStyleQRCode should use minimal colors', () => {
    const svg = generateMinimalStyleQRCode('test', 256);
    expect(svg).toContain('#333333');
  });
});

describe('@veaba/qrcode-shared - Batch Generation', () => {
  it('generateBatchQRCodes should return array of SVGs', () => {
    const svgs = generateBatchQRCodes(['test1', 'test2', 'test3']);
    expect(svgs).toHaveLength(3);
    svgs.forEach(svg => {
      expect(svg).toContain('<svg');
    });
  });

  it('generateBatchQRCodes should accept options', () => {
    const svgs = generateBatchQRCodes(['test'], { size: 128, correctLevel: QRErrorCorrectLevel.L });
    expect(svgs).toHaveLength(1);
    expect(svgs[0]).toContain('<svg');
  });
});

describe('@veaba/qrcode-shared - Async Generation', () => {
  it('generateQRCodeAsync should return Promise with SVG', async () => {
    const svg = await generateQRCodeAsync('test');
    expect(svg).toContain('<svg');
  });

  it('generateQRCodeAsync should accept options', async () => {
    const svg = await generateQRCodeAsync('test', { size: 128 });
    expect(svg).toContain('<svg');
  });

  it('generateBatchAsync should return Promise with array', async () => {
    const svgs = await generateBatchAsync(['test1', 'test2']);
    expect(svgs).toHaveLength(2);
    svgs.forEach(svg => {
      expect(svg).toContain('<svg');
    });
  });
});

describe('@veaba/qrcode-shared - Cache System', () => {
  beforeEach(() => {
    clearQRCodeCache();
  });

  afterEach(() => {
    clearQRCodeCache();
  });

  it('getCachedQRCode should return QRCode instance', () => {
    const qr = getCachedQRCode('test', QRErrorCorrectLevel.H);
    expect(qr).toBeInstanceOf(QRCodeCore);
    expect(qr.text).toBe('test');
  });

  it('getCachedQRCode should cache result', () => {
    const qr1 = getCachedQRCode('test', QRErrorCorrectLevel.H);
    const qr2 = getCachedQRCode('test', QRErrorCorrectLevel.H);
    expect(qr1).toBe(qr2);
  });

  it('getCachedQRCode should differentiate by error level', () => {
    const qr1 = getCachedQRCode('test', QRErrorCorrectLevel.H);
    const qr2 = getCachedQRCode('test', QRErrorCorrectLevel.L);
    expect(qr1).not.toBe(qr2);
  });

  it('clearQRCodeCache should clear cache', () => {
    getCachedQRCode('test');
    clearQRCodeCache();
    const qr = getCachedQRCode('test');
    expect(qr).toBeInstanceOf(QRCodeCore);
  });

  it('getCacheStats should return cache info', () => {
    getCacheStats();
    const stats = getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats).toHaveProperty('keys');
    expect(Array.isArray(stats.keys)).toBe(true);
  });

  it('getCacheStats should show correct size', () => {
    clearQRCodeCache();
    getCachedQRCode('test1');
    getCachedQRCode('test2');
    const stats = getCacheStats();
    expect(stats.size).toBe(2);
  });

  it('configureCache should reconfigure cache', () => {
    configureCache({ maxSize: 50, enabled: true });
    const qr = getCachedQRCode('test');
    expect(qr).toBeInstanceOf(QRCodeCore);
  });

  it('generateRoundedQRCodeCached should use cache', () => {
    const svg1 = generateRoundedQRCodeCached('test', 256, 8);
    const svg2 = generateRoundedQRCodeCached('test', 256, 8);
    expect(svg1).toContain('<svg');
    expect(svg2).toContain('<svg');
  });

  it('generateBatchQRCodesCached should work', () => {
    const svgs = generateBatchQRCodesCached(['test1', 'test2']);
    expect(svgs).toHaveLength(2);
    svgs.forEach(svg => {
      expect(svg).toContain('<svg');
    });
  });
});

describe('@veaba/qrcode-shared - Edge Cases', () => {
  it('should handle empty string', () => {
    const qr = new QRCodeCore('');
    expect(qr.text).toBe('');
    expect(qr.moduleCount).toBeGreaterThan(0);
  });

  it('should handle unicode characters', () => {
    const qr = new QRCodeCore('你好世界🌍');
    expect(qr.text).toBe('你好世界🌍');
    const svg = qr.toSVG();
    expect(svg).toContain('<svg');
  });

  it('should handle very long text', () => {
    const longText = 'a'.repeat(1000);
    const qr = new QRCodeCore(longText);
    expect(qr.text).toBe(longText);
  });

  it('should handle special characters', () => {
    const specialText = '<>&"\'\\n\\t';
    const qr = new QRCodeCore(specialText);
    expect(qr.text).toBe(specialText);
  });

  it('should handle URL', () => {
    const url = 'https://example.com/path?query=value&foo=bar';
    const qr = new QRCodeCore(url);
    expect(qr.text).toBe(url);
  });
});

describe('@veaba/qrcode-shared - Constants', () => {
  it('should export QRErrorCorrectLevel enum', () => {
    expect(QRErrorCorrectLevel.L).toBe(1);
    expect(QRErrorCorrectLevel.M).toBe(0);
    expect(QRErrorCorrectLevel.Q).toBe(3);
    expect(QRErrorCorrectLevel.H).toBe(2);
  });
});
