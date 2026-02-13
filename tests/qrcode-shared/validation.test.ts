/**
 * @veaba/qrcode-js-shared - Input Validation Security Tests
 *
 * 这些测试验证了独立的输入验证模块的功能
 * 注意：由于主 index.ts 文件被回滚，这里只测试验证模块本身
 */

import { describe, it, expect } from 'vitest';
import {
  validateQRCodeInput,
  validateStyledOptions,
  isValidColor,
  QRCodeInputError,
} from '../../packages/qrcode-js-shared/src/validation-module.js';

describe('@veaba/qrcode-js-shared - Input Validation (Standalone Module)', () => {
  describe('validateQRCodeInput', () => {
    it('should accept valid text input', () => {
      const result = validateQRCodeInput('Hello World');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept URL input', () => {
      const result = validateQRCodeInput('https://example.com/path?query=value');
      expect(result.valid).toBe(true);
    });

    it('should accept unicode characters', () => {
      const result = validateQRCodeInput('你好世界🌍');
      expect(result.valid).toBe(true);
    });

    it('should accept special characters like <>& in text', () => {
      const result = validateQRCodeInput('a & b < c');
      expect(result.valid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateQRCodeInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.TEXT_EMPTY);
      expect(result.message).toContain('empty');
    });

    it('should reject non-string type (number)', () => {
      const result = validateQRCodeInput(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_TYPE);
      expect(result.message).toContain('string');
    });

    it('should reject non-string type (null)', () => {
      const result = validateQRCodeInput(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_TYPE);
    });

    it('should reject non-string type (object)', () => {
      const result = validateQRCodeInput({ text: 'test' } as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_TYPE);
    });

    it('should reject text exceeding max length (10000 chars)', () => {
      const longText = 'a'.repeat(10001);
      const result = validateQRCodeInput(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.TEXT_TOO_LONG);
      expect(result.message).toContain('10000');
    });

    it('should accept text exactly at max character limit but under byte limit', () => {
      const text = 'a'.repeat(2950);
      const result = validateQRCodeInput(text);
      expect(result.valid).toBe(true);
    });

    it('should reject text exceeding byte limit (2953 bytes)', () => {
      const longText = '你'.repeat(1000);
      const result = validateQRCodeInput(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.BYTE_LIMIT_EXCEEDED);
      expect(result.message).toContain('2953');
    });

    it('should reject script tags', () => {
      const result = validateQRCodeInput('<script>alert("xss")</script>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
      expect(result.message).toContain('script');
    });

    it('should reject uppercase script tags', () => {
      const result = validateQRCodeInput('<SCRIPT>alert(1)</SCRIPT>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
    });

    it('should reject javascript: protocol', () => {
      const result = validateQRCodeInput('javascript:alert(1)');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
      expect(result.message).toContain('javascript:');
    });

    it('should reject vbscript: protocol', () => {
      const result = validateQRCodeInput('vbscript:msgbox(1)');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
    });

    it('should reject onload event', () => {
      const result = validateQRCodeInput('<img src=x onload=alert(1)>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
    });

    it('should reject onerror event', () => {
      const result = validateQRCodeInput('<img src=x onerror=alert(1)>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
    });

    it('should reject onclick event', () => {
      const result = validateQRCodeInput('<div onclick=alert(1)>click</div>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
    });

    it('should reject iframe tags', () => {
      const result = validateQRCodeInput('<iframe src="evil.com"></iframe>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(QRCodeInputError.INVALID_CHARS);
      expect(result.message).toContain('iframe');
    });
  });

  describe('isValidColor', () => {
    it('should accept valid hex colors', () => {
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#FFF')).toBe(true);
      expect(isValidColor('#abc')).toBe(true);
      expect(isValidColor('#123456')).toBe(true);
    });

    it('should accept invalid hex colors with 3-8 chars', () => {
      expect(isValidColor('#1234')).toBe(true);
      expect(isValidColor('#12345678')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidColor('#GGG')).toBe(false);
      expect(isValidColor('#ZZ')).toBe(false);
      expect(isValidColor('#12')).toBe(false);
    });

    it('should accept rgb() format', () => {
      expect(isValidColor('rgb(0, 0, 0)')).toBe(true);
      expect(isValidColor('rgb(255, 255, 255)')).toBe(true);
      expect(isValidColor('rgb(128, 64, 32)')).toBe(true);
    });

    it('should accept rgba() format', () => {
      expect(isValidColor('rgba(0, 0, 0, 0.5)')).toBe(true);
      expect(isValidColor('rgba(255,255,255,1)')).toBe(true);
    });

    it('should accept common named colors', () => {
      expect(isValidColor('black')).toBe(true);
      expect(isValidColor('white')).toBe(true);
      expect(isValidColor('red')).toBe(true);
      expect(isValidColor('green')).toBe(true);
      expect(isValidColor('blue')).toBe(true);
      expect(isValidColor('yellow')).toBe(true);
      expect(isValidColor('cyan')).toBe(true);
      expect(isValidColor('magenta')).toBe(true);
      expect(isValidColor('gray')).toBe(true);
      expect(isValidColor('silver')).toBe(true);
      expect(isValidColor('maroon')).toBe(true);
      expect(isValidColor('olive')).toBe(true);
      expect(isValidColor('lime')).toBe(true);
      expect(isValidColor('aqua')).toBe(true);
      expect(isValidColor('teal')).toBe(true);
      expect(isValidColor('navy')).toBe(true);
      expect(isValidColor('fuchsia')).toBe(true);
      expect(isValidColor('purple')).toBe(true);
      expect(isValidColor('orange')).toBe(true);
      expect(isValidColor('pink')).toBe(true);
      expect(isValidColor('transparent')).toBe(true);
    });

    it('should reject invalid colors', () => {
      expect(isValidColor('')).toBe(false);
      expect(isValidColor('notacolor')).toBe(false);
      expect(isValidColor('#')).toBe(false);
      expect(isValidColor('rgb()')).toBe(false);
    });
  });

  describe('validateStyledOptions', () => {
    it('should accept valid styled options', () => {
      const result = validateStyledOptions({
        size: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        borderRadius: 8,
        quietZone: 2,
      });
      expect(result.valid).toBe(true);
    });

    it('should accept options with gradient', () => {
      const result = validateStyledOptions({
        size: 512,
        gradient: { color1: '#667eea', color2: '#764ba2' },
      });
      expect(result.valid).toBe(true);
    });

    it('should accept options with logo regions', () => {
      const result = validateStyledOptions({
        size: 256,
        logoRegions: [
          { row: 10, col: 10, size: 6 },
          { row: 0, col: 0, size: 5 },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('should reject size below minimum (32)', () => {
      const result = validateStyledOptions({ size: 16 });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('32');
    });

    it('should reject size above maximum (4096)', () => {
      const result = validateStyledOptions({ size: 5000 });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('4096');
    });

    it('should reject size of wrong type', () => {
      const result = validateStyledOptions({ size: '256' as any });
      expect(result.valid).toBe(false);
    });

    it('should reject negative borderRadius', () => {
      const result = validateStyledOptions({ borderRadius: -1 });
      expect(result.valid).toBe(false);
    });

    it('should reject borderRadius above maximum (100)', () => {
      const result = validateStyledOptions({ borderRadius: 101 });
      expect(result.valid).toBe(false);
    });

    it('should reject quietZone above maximum (10)', () => {
      const result = validateStyledOptions({ quietZone: 11 });
      expect(result.valid).toBe(false);
    });

    it('should reject quietZone below minimum (0)', () => {
      const result = validateStyledOptions({ quietZone: -1 });
      expect(result.valid).toBe(false);
    });

    it('should reject invalid colorDark', () => {
      const result = validateStyledOptions({
        size: 256,
        colorDark: '<script>alert(1)</script>',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('colorDark');
    });

    it('should reject invalid colorLight', () => {
      const result = validateStyledOptions({
        size: 256,
        colorLight: 'javascript:alert(1)',
      });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('colorLight');
    });

    it('should reject invalid gradient color1', () => {
      const result = validateStyledOptions({
        gradient: { color1: '#GGG', color2: '#000' },
      });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('gradient');
    });

    it('should reject invalid gradient color2', () => {
      const result = validateStyledOptions({
        gradient: { color1: '#000', color2: 'invalid' },
      });
      expect(result.valid).toBe(false);
    });

    it('should reject non-array logoRegions', () => {
      const result = validateStyledOptions({
        logoRegions: 'not-an-array' as any,
      });
      expect(result.valid).toBe(false);
      expect(result.message).toContain('array');
    });

    it('should reject logo region with negative row', () => {
      const result = validateStyledOptions({
        logoRegions: [{ row: -1, col: 10, size: 5 }],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject logo region with negative col', () => {
      const result = validateStyledOptions({
        logoRegions: [{ row: 10, col: -1, size: 5 }],
      });
      expect(result.valid).toBe(false);
    });

    it('should reject logo region with negative size', () => {
      const result = validateStyledOptions({
        logoRegions: [{ row: 10, col: 10, size: -1 }],
      });
      expect(result.valid).toBe(false);
    });
  });
});

describe('@veaba/qrcode-js-shared - Validation Performance', () => {
  it('should validate input quickly', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      validateQRCodeInput('test text');
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(20);
  });

  it('should validate styled options quickly', () => {
    const options = {
      size: 256,
      colorDark: '#000000',
      colorLight: '#ffffff',
    };
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      validateStyledOptions(options);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(20);
  });
});

describe('@veaba/qrcode-js-shared - Validation Edge Cases', () => {
  it('should handle strings with mixed unicode', () => {
    const result = validateQRCodeInput('Hello你好🌍World');
    expect(result.valid).toBe(true);
  });

  it('should handle very long valid text near byte limit', () => {
    const text = 'a'.repeat(2900);
    const result = validateQRCodeInput(text);
    expect(result.valid).toBe(true);
  });

  it('should handle emojis', () => {
    const result = validateQRCodeInput('😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘');
    expect(result.valid).toBe(true);
  });

  it('should handle zero-width characters', () => {
    const result = validateQRCodeInput('test\u200Btext');
    expect(result.valid).toBe(true);
  });

  it('should accept boundary size values', () => {
    const result1 = validateStyledOptions({ size: 32 });
    expect(result1.valid).toBe(true);

    const result2 = validateStyledOptions({ size: 4096 });
    expect(result2.valid).toBe(true);
  });

  it('should accept boundary borderRadius values', () => {
    const result1 = validateStyledOptions({ borderRadius: 0 });
    expect(result1.valid).toBe(true);

    const result2 = validateStyledOptions({ borderRadius: 100 });
    expect(result2.valid).toBe(true);
  });

  it('should accept boundary quietZone values', () => {
    const result1 = validateStyledOptions({ quietZone: 0 });
    expect(result1.valid).toBe(true);

    const result2 = validateStyledOptions({ quietZone: 10 });
    expect(result2.valid).toBe(true);
  });
});
