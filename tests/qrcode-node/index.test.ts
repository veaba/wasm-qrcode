/**
 * @veaba/qrcode-node - Unit Tests
 * Tests for Node.js specific implementation
 */

import { describe, it, expect } from 'vitest';
import {
  QRCode,
  QRErrorCorrectLevel,
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
} from '../../packages/qrcode-node/src/index.ts';

describe('@veaba/qrcode-node - QRCode Class', () => {
  it('should create QRCode with text', () => {
    const qr = new QRCode('Hello World');
    expect(qr.text).toBe('Hello World');
    expect(qr.moduleCount).toBeGreaterThan(0);
  });

  it('should use default error correction level H', () => {
    const qr = new QRCode('test');
    expect(qr.correctLevel).toBe(QRErrorCorrectLevel.H);
  });

  it('should accept custom error correction level', () => {
    const qr = new QRCode('test', QRErrorCorrectLevel.L);
    expect(qr.correctLevel).toBe(QRErrorCorrectLevel.L);
  });

  it('should have typeNumber property', () => {
    const qr = new QRCode('test');
    expect(qr.typeNumber).toBeGreaterThan(0);
  });

  it('should isDark return boolean', () => {
    const qr = new QRCode('test');
    expect(typeof qr.isDark(0, 0)).toBe('boolean');
  });

  it('should getModuleCount return correct value', () => {
    const qr = new QRCode('test');
    expect(qr.getModuleCount()).toBe(qr.moduleCount);
  });

  it('should toSVG generate valid SVG string', () => {
    const qr = new QRCode('test');
    const svg = qr.toSVG(256);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should toStyledSVG generate SVG with options', () => {
    const qr = new QRCode('test');
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
    const qr = new QRCode('test');
    const svg = qr.toStyledSVG({
      size: 256,
      gradient: { color1: '#667eea', color2: '#764ba2' },
    });
    expect(svg).toContain('linearGradient');
  });

  it('should toStyledSVG with quiet zone', () => {
    const qr = new QRCode('test');
    const svg = qr.toStyledSVG({ quietZone: 4 });
    expect(svg).toContain('<svg');
  });

  it('should toPNGBuffer return Buffer', () => {
    const qr = new QRCode('test');
    const buffer = qr.toPNGBuffer(256);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should toPNGBuffer generate valid BMP', () => {
    const qr = new QRCode('test');
    const buffer = qr.toPNGBuffer(100);
    // BMP file signature
    expect(buffer[0]).toBe(0x42); // 'B'
    expect(buffer[1]).toBe(0x4D); // 'M'
  });

  it('should toPNGBuffer use default size 256', () => {
    const qr = new QRCode('test');
    const buffer = qr.toPNGBuffer();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should toPNGBuffer generate different sizes', () => {
    const qr = new QRCode('test');
    const buffer1 = qr.toPNGBuffer(100);
    const buffer2 = qr.toPNGBuffer(200);
    expect(buffer1.length).toBeLessThan(buffer2.length);
  });
});

describe('@veaba/qrcode-node - Style Generator Functions', () => {
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

  it('generateAlipayStyleQRCode should use Alipay blue', () => {
    const svg = generateAlipayStyleQRCode('test', 256);
    expect(svg).toContain('#1677FF');
    expect(svg).toContain('<svg');
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

describe('@veaba/qrcode-node - Batch Generation', () => {
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

describe('@veaba/qrcode-node - Async Generation', () => {
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

describe('@veaba/qrcode-node - Constants', () => {
  it('should export QRErrorCorrectLevel enum', () => {
    expect(QRErrorCorrectLevel.L).toBe(1);
    expect(QRErrorCorrectLevel.M).toBe(0);
    expect(QRErrorCorrectLevel.Q).toBe(3);
    expect(QRErrorCorrectLevel.H).toBe(2);
  });
});

describe('@veaba/qrcode-node - Edge Cases', () => {
  it('should handle empty string', () => {
    const qr = new QRCode('');
    expect(qr.text).toBe('');
    expect(qr.moduleCount).toBeGreaterThan(0);
  });

  it('should handle unicode characters', () => {
    const qr = new QRCode('你好世界🌍');
    expect(qr.text).toBe('你好世界🌍');
    const svg = qr.toSVG();
    expect(svg).toContain('<svg');
  });

  it('should handle very long text', () => {
    const longText = 'a'.repeat(1000);
    const qr = new QRCode(longText);
    expect(qr.text).toBe(longText);
  });

  it('should handle URL', () => {
    const url = 'https://example.com/path?query=value';
    const qr = new QRCode(url);
    expect(qr.text).toBe(url);
  });

  it('toPNGBuffer should handle edge cases', () => {
    const qr = new QRCode('test');
    const buffer = qr.toPNGBuffer(10); // Very small size
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
