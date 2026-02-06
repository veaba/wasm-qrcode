/**
 * Type definitions for @veaba/qrcode-wasm
 * Matches the API of @veaba/qrcode-js
 */

// ============================================
// Enums
// ============================================

/**
 * QR Code error correction level
 * L: ~7%, M: ~15%, Q: ~25%, H: ~30%
 */
export declare enum QRErrorCorrectLevel {
  L = 1,  // Low (~7%)
  M = 0,  // Medium (~15%)
  Q = 3,  // Quartile (~25%)
  H = 2   // High (~30%)
}

/**
 * QR Code mode
 */
export const QRMode = {
  MODE_8BIT_BYTE: 4,
} as const;

// Alias for WASM CorrectLevel
export type CorrectLevel = QRErrorCorrectLevel;

// ============================================
// Options Interfaces
// ============================================

export interface QRCodeOptions {
  /** QRCode text content */
  text: string;
  /** Error correction level */
  correctLevel?: QRErrorCorrectLevel;
  /** QRCode size in pixels */
  size?: number;
  /** Dark color */
  colorDark?: string;
  /** Light color */
  colorLight?: string;
}

export interface StyledSVGOptions {
  /** Size in pixels */
  size?: number;
  /** Dark color */
  colorDark?: string;
  /** Light color */
  colorLight?: string;
  /** Border radius */
  borderRadius?: number;
  /** Gradient configuration */
  gradient?: { color1: string; color2: string } | null;
  /** Quiet zone size */
  quietZone?: number;
  /** Logo regions */
  logoRegions?: Array<{ row: number; col: number; size: number }>;
}

export interface QRCodeResult {
  /** Text content */
  text: string;
  /** SVG string */
  svg: string;
  /** Module count */
  moduleCount: number;
}

export interface CacheOptions {
  maxSize?: number;
  enabled?: boolean;
}

// ============================================
// Core Class Interface
// ============================================

export declare class QRCodeCore {
  constructor(text: string, correctLevel?: QRErrorCorrectLevel);
  
  /** Module count */
  readonly moduleCount: number;
  
  /** Get module count */
  getModuleCount(): number;
  
  /** Check if position is dark */
  isDark(row: number, col: number): boolean;
  
  /** Generate SVG */
  toSVG(size?: number): string;
  
  /** Generate styled SVG */
  toStyledSVG(options?: StyledSVGOptions): string;
}

// Alias
export type QRCode = QRCodeCore;

// ============================================
// Cache Functions
// ============================================

export declare function getCachedQRCode(text: string, correctLevel?: QRErrorCorrectLevel): QRCodeCore;
export declare function clearQRCodeCache(): void;
export declare function getCacheStats(): { size: number; maxSize: number; keys: string[] };
export declare function configureCache(options: CacheOptions): void;

// ============================================
// Style Generator Functions
// ============================================

export declare function generateRoundedQRCode(text: string, size?: number, radius?: number): string;
export declare function generateQRCodeWithLogoArea(text: string, size?: number, logoRatio?: number): string;
export declare function generateGradientQRCode(text: string, size?: number, color1?: string, color2?: string): string;
export declare function generateWechatStyleQRCode(text: string, size?: number): string;
export declare function generateDouyinStyleQRCode(text: string, size?: number): string;
export declare function generateAlipayStyleQRCode(text: string, size?: number): string;
export declare function generateXiaohongshuStyleQRCode(text: string, size?: number): string;
export declare function generateCyberpunkStyleQRCode(text: string, size?: number): string;
export declare function generateRetroStyleQRCode(text: string, size?: number): string;
export declare function generateMinimalStyleQRCode(text: string, size?: number): string;

// ============================================
// Cached Style Generator Functions
// ============================================

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

// ============================================
// Batch/Async Functions
// ============================================

export declare function generateBatchQRCodes(texts: string[], options?: Partial<QRCodeOptions>): string[];
export declare function generateBatchQRCodesCached(
  texts: string[],
  options?: Partial<QRCodeOptions> & { styled?: boolean; style?: StyledSVGOptions }
): string[];

export declare function generateQRCodeAsync(
  text: string,
  options?: Partial<QRCodeOptions> & { styled?: boolean; style?: StyledSVGOptions; cache?: boolean }
): Promise<QRCodeResult>;

export declare function generateBatchAsync(
  texts: string[],
  options?: Partial<QRCodeOptions> & { styled?: boolean; style?: StyledSVGOptions; cache?: boolean }
): Promise<QRCodeResult[]>;

// ============================================
// Constants
// ============================================

export declare const VERSION: string;
export declare function getVersionInfo(): string;

// ============================================
// WASM Specific Types
// ============================================

export interface WasmModule {
  init(): Promise<void>;
}

export declare function init(): Promise<void>;
export declare function init_thread_pool(num_threads: number): Promise<void>;
export declare function is_parallel_supported(): boolean;
export declare function greet(): void;

// Re-export WASM generated types (type-only)
export type {
  QRCodeWasm,
  QRCodeGenerator,
  StyledQRCode,
  QRCodeStyle,
} from '../pkg/qrcodes.js';

// ============================================
// Default Export
// ============================================

export default QRCodeCore;
