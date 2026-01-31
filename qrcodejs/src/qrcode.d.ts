// QRCode JS 类型声明

export const enum QRErrorCorrectLevel {
  L = 1,
  M = 0,
  Q = 3,
  H = 2
}

export const enum QRMode {
  MODE_NUMBER = 1 << 0,
  MODE_ALPHA_NUM = 1 << 1,
  MODE_8BIT_BYTE = 1 << 2,
  MODE_KANJI = 1 << 3
}

export interface QRCodeOptions {
  text?: string;
  width?: number;
  height?: number;
  colorDark?: string;
  colorLight?: string;
  correctLevel?: QRErrorCorrectLevel;
}

export interface StyledSvgOptions {
  colorDark?: string;
  colorLight?: string;
  borderRadius?: number;
  gradient?: { color1: string; color2: string } | null;
  quietZone?: number;
}

export declare class QRCode {
  constructor(text: string, errorCorrectionLevel?: QRErrorCorrectLevel);
  
  // 基础方法
  make(text: string, errorCorrectionLevel?: QRErrorCorrectLevel): void;
  isDark(row: number, col: number): boolean;
  
  // 与 WASM 兼容的 API
  get_svg(): string;
  get_module_count(): number;
  toSVG(size?: number): string;
  get_styled_svg(options?: StyledSvgOptions): string;
}

// 样式生成函数
export declare function generate_rounded_qrcode(text: string, size?: number, radius?: number): string;
export declare function generate_qrcode_with_logo_area(text: string, size?: number, logoRatio?: number): string;
export declare function generate_gradient_qrcode(text: string, size?: number, color1?: string, color2?: string): string;
export declare function generate_wechat_style_qrcode(text: string, size?: number): string;
export declare function generate_douyin_style_qrcode(text: string, size?: number): string;
export declare function generate_alipay_style_qrcode(text: string, size?: number): string;
export declare function generate_xiaohongshu_style_qrcode(text: string, size?: number): string;
export declare function generate_cyberpunk_style_qrcode(text: string, size?: number): string;
export declare function generate_retro_style_qrcode(text: string, size?: number): string;
export declare function generate_minimal_style_qrcode(text: string, size?: number): string;

// 兼容导出
export { QRCode as default };
