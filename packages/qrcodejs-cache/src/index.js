/**
 * @veaba/qrcodejs-cache - QRCode library with LRU caching
 * 
 * This package re-exports everything from @veaba/shared.
 * All functionality is now unified in @veaba/shared.
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
  
  // Style generators (cached by default)
  generateRoundedQRCodeCached as generateRoundedQRCode,
  generateQRCodeWithLogoAreaCached as generateQRCodeWithLogoArea,
  generateGradientQRCodeCached as generateGradientQRCode,
  generateWechatStyleQRCodeCached as generateWechatStyleQRCode,
  generateDouyinStyleQRCodeCached as generateDouyinStyleQRCode,
  generateAlipayStyleQRCodeCached as generateAlipayStyleQRCode,
  generateXiaohongshuStyleQRCodeCached as generateXiaohongshuStyleQRCode,
  generateCyberpunkStyleQRCodeCached as generateCyberpunkStyleQRCode,
  generateRetroStyleQRCodeCached as generateRetroStyleQRCode,
  generateMinimalStyleQRCodeCached as generateMinimalStyleQRCode,
  
  // Snake_case aliases (cached)
  generateRoundedQRCodeCached as generate_rounded_qrcode,
  generateQRCodeWithLogoAreaCached as generate_qrcode_with_logo_area,
  generateGradientQRCodeCached as generate_gradient_qrcode,
  generateWechatStyleQRCodeCached as generate_wechat_style_qrcode,
  generateDouyinStyleQRCodeCached as generate_douyin_style_qrcode,
  generateAlipayStyleQRCodeCached as generate_alipay_style_qrcode,
  generateXiaohongshuStyleQRCodeCached as generate_xiaohongshu_style_qrcode,
  generateCyberpunkStyleQRCodeCached as generate_cyberpunk_style_qrcode,
  generateRetroStyleQRCodeCached as generate_retro_style_qrcode,
  generateMinimalStyleQRCodeCached as generate_minimal_style_qrcode,
  
  // Batch generation (cached)
  generateBatchQRCodesCached as generateBatchQRCodes,
  
  // Async generation
  generateQRCodeAsync,
  generateBatchAsync,
  
  // Cache management
  getCachedQRCode,
  clearQRCodeCache,
  getCacheStats,
  configureCache,
  
  // Version info
  VERSION,
  getVersionInfo,
} from '@veaba/shared';

// Default export
export { QRCodeCore as default } from '@veaba/shared';
