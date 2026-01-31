/**
 * @veaba/qrcodejs-perf - High-performance QRCode library (no caching)
 * 
 * This package re-exports everything from @veaba/qrcode-shared.
 * All functionality is now unified in @veaba/qrcode-shared.
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

  // Snake_case aliases (non-cached)
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

  // Batch generation (non-cached)
  generateBatchQRCodes,

  // Async generation (non-cached by default)
  generateQRCodeAsync,
  generateBatchAsync,

  // Version info
  VERSION,
  getVersionInfo,
} from '@veaba/qrcode-shared';

// Default export
export { QRCodeCore as default } from '@veaba/qrcode-shared';
