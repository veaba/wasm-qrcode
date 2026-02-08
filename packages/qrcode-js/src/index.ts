/**
 * @veaba/qrcode-js - Browser-compatible QRCode library with caching
 * 
 * This package re-exports everything from @veaba/qrcode-shared.
 * All functionality is now unified in @veaba/qrcode-shared.
 * 
 * @deprecated This package is now a thin wrapper around @veaba/qrcode-shared.
 * Please use @veaba/qrcode-shared directly or @veaba/qrcode-js-cache for caching features.
 */

// Re-export everything from shared
export {
  // Core classes
  QRCodeCore,
  QRCode,
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

  // Style generators (non-cached)
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

  // Style generators (cached)
  generateRoundedQRCodeCached,
  generateQRCodeWithLogoAreaCached,
  generateGradientQRCodeCached,
  generateWechatStyleQRCodeCached,
  generateDouyinStyleQRCodeCached,
  generateAlipayStyleQRCodeCached,
  generateXiaohongshuStyleQRCodeCached,
  generateCyberpunkStyleQRCodeCached,
  generateRetroStyleQRCodeCached,
  generateMinimalStyleQRCodeCached,

  // Batch generation
  generateBatchQRCodes,
  generateBatchQRCodesCached,

  // Async generation (return SVG strings, not QRCodeResult objects)
  generateQRCodeAsync,
  generateBatchAsync,

  // Cache management
  getCachedQRCode,
  clearQRCodeCache,
  getCacheStats,
  configureCache,

  // Snake_case aliases
  generate_rounded_qrcode,
  generate_qrcode_with_logo_area,
  generate_gradient_qrcode,
  generate_wechat_style_qrcode,
  generate_douyin_style_qrcode,
  generate_alipay_style_qrcode,
  generate_xiaohongshu_style_qrcode,
  generate_cyberpunk_style_qrcode,
  generate_retro_style_qrcode,
  generate_minimal_style_qrcode,

  // Version info
  VERSION,
  getVersionInfo,
} from '@veaba/qrcode-shared';

// Default export
export { QRCodeCore as default } from '@veaba/qrcode-shared';
