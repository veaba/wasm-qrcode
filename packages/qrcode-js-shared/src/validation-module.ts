/**
 * 输入验证安全模块
 *
 * 这是一个独立的验证模块，用于 QRCode 输入和样式的安全验证
 */

// ============ 输入验证和安全 ============

/// QRCode 输入验证错误
export enum QRCodeInputError {
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  TEXT_EMPTY = 'TEXT_EMPTY',
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_CHARS = 'INVALID_CHARS',
  BYTE_LIMIT_EXCEEDED = 'BYTE_LIMIT_EXCEEDED'
}

/// 验证结果接口
export interface ValidationResult {
  valid: boolean;
  error?: QRCodeInputError;
  message?: string;
}

/// 样式选项接口（复制自主文件以保持独立性）
export interface StyledSVGOptions {
  size?: number;
  colorDark?: string;
  colorLight?: string;
  borderRadius?: number;
  gradient?: { color1: string; color2: string } | null;
  quietZone?: number;
  logoRegions?: Array<{ row: number; col: number; size: number }>;
}

/// 安全配置常量
const SECURITY_CONFIG = {
  MAX_TEXT_LENGTH: 10000,
  MAX_BYTE_LENGTH: 2953,
  DANGEROUS_PATTERNS: [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /<iframe/i
  ] as const,
} as const;

/**
 * 验证 QRCode 输入文本
 */
export function validateQRCodeInput(text: unknown): ValidationResult {
  if (typeof text !== 'string') {
    return {
      valid: false,
      error: QRCodeInputError.INVALID_TYPE,
      message: `Input must be a string, got ${typeof text}`
    };
  }

  if (text.length === 0) {
    return {
      valid: false,
      error: QRCodeInputError.TEXT_EMPTY,
      message: 'Input text cannot be empty'
    };
  }

  if (text.length > SECURITY_CONFIG.MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: QRCodeInputError.TEXT_TOO_LONG,
      message: `Text length exceeds maximum of ${SECURITY_CONFIG.MAX_TEXT_LENGTH} characters`
    };
  }

  const byteLength = new TextEncoder().encode(text).length;
  if (byteLength > SECURITY_CONFIG.MAX_BYTE_LENGTH) {
    return {
      valid: false,
      error: QRCodeInputError.BYTE_LIMIT_EXCEEDED,
      message: `Encoded text exceeds maximum QR Code capacity of ${SECURITY_CONFIG.MAX_BYTE_LENGTH} bytes`
    };
  }

  for (const pattern of SECURITY_CONFIG.DANGEROUS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_CHARS,
        message: `Text contains potentially dangerous characters: ${pattern.source}`
      };
    }
  }

  return { valid: true };
}

/**
 * 安全版本的颜色值验证
 */
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;

  if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) return true;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) return true;

  const safeColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'silver', 'maroon', 'olive', 'lime', 'aqua', 'teal',
    'navy', 'fuchsia', 'purple', 'orange', 'pink', 'transparent'
  ];
  return safeColors.includes(color.toLowerCase());
}

/**
 * 验证样式选项
 */
export function validateStyledOptions(options: StyledSVGOptions): ValidationResult {
  if (options.colorDark && !isValidColor(options.colorDark)) {
    return {
      valid: false,
      error: QRCodeInputError.INVALID_CHARS,
      message: `Invalid colorDark value: ${options.colorDark}`
    };
  }

  if (options.colorLight && !isValidColor(options.colorLight)) {
    return {
      valid: false,
      error: QRCodeInputError.INVALID_CHARS,
      message: `Invalid colorLight value: ${options.colorLight}`
    };
  }

  if (options.gradient) {
    if (!isValidColor(options.gradient.color1)) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_CHARS,
        message: `Invalid gradient color1: ${options.gradient.color1}`
      };
    }
    if (!isValidColor(options.gradient.color2)) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_CHARS,
        message: `Invalid gradient color2: ${options.gradient.color2}`
      };
    }
  }

  if (options.size !== undefined) {
    if (typeof options.size !== 'number' || options.size < 32 || options.size > 4096) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_TYPE,
        message: 'Size must be a number between 32 and 4096'
      };
    }
  }

  if (options.borderRadius !== undefined) {
    if (typeof options.borderRadius !== 'number' || options.borderRadius < 0 || options.borderRadius > 100) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_TYPE,
        message: 'Border radius must be a number between 0 and 100'
      };
    }
  }

  if (options.quietZone !== undefined) {
    if (typeof options.quietZone !== 'number' || options.quietZone < 0 || options.quietZone > 10) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_TYPE,
        message: 'Quiet zone must be a number between 0 and 10'
      };
    }
  }

  if (options.logoRegions) {
    if (!Array.isArray(options.logoRegions)) {
      return {
        valid: false,
        error: QRCodeInputError.INVALID_TYPE,
        message: 'Logo regions must be an array'
      };
    }
    for (const region of options.logoRegions) {
      if (typeof region.row !== 'number' || typeof region.col !== 'number' || typeof region.size !== 'number') {
        return {
          valid: false,
          error: QRCodeInputError.INVALID_TYPE,
          message: 'Each logo region must have row, col, and size as numbers'
        };
      }
      if (region.row < 0 || region.col < 0 || region.size < 0) {
        return {
          valid: false,
          error: QRCodeInputError.INVALID_TYPE,
          message: 'Logo region values must be non-negative'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * 抛出验证错误（如果验证失败）
 */
export function throwIfInvalid(result: ValidationResult): void {
  if (!result.valid) {
    throw new Error(`QRCode validation failed: ${result.message} (${result.error})`);
  }
}
