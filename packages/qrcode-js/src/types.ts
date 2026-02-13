// @veaba/qrcode-js 类型定义
// Re-exports from @veaba/qrcode-js-shared with additional cached versions

export {
  // Core classes
  QRCodeCore,
  QRMath,
  Polynomial,
  BitBuffer,

  // Enums and constants
  QRErrorCorrectLevel,
  QRMode,
  PATTERN_POSITION_TABLE,
  QRCodeLimitLength,
  RS_BLOCK_TABLE,

  // Utility functions
  getErrorCorrectPolynomial,
  getRSBlocks,
  getTypeNumber,

  // Style generators (non-cached versions from shared)
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

} from '@veaba/qrcode-js-shared';

export type {
  QRCodeOptions,
  StyledSVGOptions,
  RSBlock,
} from '@veaba/qrcode-js-shared';

import type { QRCodeCore, QRErrorCorrectLevel, QRCodeOptions, StyledSVGOptions } from '@veaba/qrcode-js-shared';

// QRCode is an alias for QRCodeCore
export type QRCode = QRCodeCore;

// Cache management
export declare function getCachedQRCode(text: string, correctLevel: QRErrorCorrectLevel): QRCodeCore;
export declare function clearQRCodeCache(): void;
export declare function getCacheStats(): { size: number; maxSize: number; keys: string[] };

// Cached style generators (with caching)
export declare function generateRoundedQRCodeCached(text: string, size?: number, radius?: number): string;
export declare function generateQRCodeWithLogoAreaCached(text: string, size?: number, logoRatio?: number): string;
export declare function generateGradientQRCodeCached(text: string, size?: number, color1?: string, color2?: string): string;
export declare function generateWechatStyleQRCodeCached(text: string, size?: number): string;
export declare function generateDouyinStyleQRCodeCached(text: string, size?: number): string;
export declare function generateAlipayStyleQRCodeCached(text: string, size?: number): string;
export declare function generateXiaohongshuStyleQRCodeCached(text: string, size?: number): string;
export declare function generateCyberpunkStyleQRCodeCached(text: string, size?: number): string;
export declare function generateRetroStyleQRCodeCached(text: string, size?: number): string;
export declare function generateMinimalStyleQRCodeCached(text: string, size?: number): string;

// Cached batch generation
export declare function generateBatchQRCodesCached(
  texts: string[],
  options?: Partial<QRCodeOptions> & { styled?: boolean; style?: StyledSVGOptions }
): string[];

// Async generation with optional caching (using Advanced versions from shared)
export interface QRCodeResult {
  text: string;
  svg: string;
  moduleCount: number;
}

export declare function generateQRCodeAsync(
  text: string,
  options?: Partial<QRCodeOptions> & {
    styled?: boolean;
    style?: StyledSVGOptions;
    cache?: boolean;
  }
): Promise<QRCodeResult>;

export declare function generateBatchAsync(
  texts: string[],
  options?: Partial<QRCodeOptions> & {
    styled?: boolean;
    style?: StyledSVGOptions;
    cache?: boolean;
  }
): Promise<QRCodeResult[]>;

// Backward compatibility aliases (snake_case)
export declare const generate_rounded_qrcode: typeof generateRoundedQRCodeCached;
export declare const generate_qrcode_with_logo_area: typeof generateQRCodeWithLogoAreaCached;
export declare const generate_gradient_qrcode: typeof generateGradientQRCodeCached;
export declare const generate_wechat_style_qrcode: typeof generateWechatStyleQRCodeCached;
export declare const generate_douyin_style_qrcode: typeof generateDouyinStyleQRCodeCached;
export declare const generate_alipay_style_qrcode: typeof generateAlipayStyleQRCodeCached;
export declare const generate_xiaohongshu_style_qrcode: typeof generateXiaohongshuStyleQRCodeCached;
export declare const generate_cyberpunk_style_qrcode: typeof generateCyberpunkStyleQRCodeCached;
export declare const generate_retro_style_qrcode: typeof generateRetroStyleQRCodeCached;
export declare const generate_minimal_style_qrcode: typeof generateMinimalStyleQRCodeCached;

// Default export
export default QRCodeCore;
