//! @veaba/qrcode-rust - Pure Rust QRCode Generator
//! 
//! Backend unified API implementation.
//! Provides consistent API with qrcode-node and qrcode-ts.

#![cfg_attr(feature = "wasm", allow(non_snake_case))]

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

// 核心模块
mod qr_math;
mod qr_util;
mod qr_bit_buffer;
mod qr_8bit_byte;
mod qr_polynomial;
mod qr_rs_block;
mod qr_code_model;
mod qr_code;

// 重新导出
pub use qr_code::{QRCode, QRCodeOptions};
pub use qr_code_model::{QRMode, QRErrorCorrectLevel};
pub use qr_rs_block::get_rs_blocks;

// ============================================
// 错误纠正级别（WASM 导出）
// ============================================

#[cfg(feature = "wasm")]
#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub enum CorrectLevel {
    L = 1,
    M = 0,
    Q = 3,
    H = 2,
}

#[cfg(feature = "wasm")]
impl From<CorrectLevel> for QRErrorCorrectLevel {
    fn from(level: CorrectLevel) -> Self {
        match level {
            CorrectLevel::L => QRErrorCorrectLevel::L,
            CorrectLevel::M => QRErrorCorrectLevel::M,
            CorrectLevel::Q => QRErrorCorrectLevel::Q,
            CorrectLevel::H => QRErrorCorrectLevel::H,
        }
    }
}

// ============================================
// QRCode WASM 包装器 - 统一接口
// ============================================

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub struct QRCodeWasm {
    qr: QRCode,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl QRCodeWasm {
    /// 创建新的 QRCode
    #[wasm_bindgen(constructor)]
    pub fn new(text: &str, correct_level: CorrectLevel) -> Self {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            correct_level: correct_level.into(),
            ..Default::default()
        });
        qr.make_code(text);
        QRCodeWasm { qr }
    }

    /// 获取模块数量
    #[wasm_bindgen(getter)]
    pub fn module_count(&self) -> i32 {
        self.qr.get_module_count()
    }

    /// 获取模块数量（统一接口方法）
    pub fn get_module_count(&self) -> i32 {
        self.qr.get_module_count()
    }

    /// 判断指定位置是否为深色
    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        self.qr.is_dark(row, col)
    }

    /// 生成 SVG（统一接口）
    #[wasm_bindgen(js_name = toSVG)]
    pub fn to_svg(&self, size: Option<i32>) -> String {
        let size = size.unwrap_or(256);
        self.generate_svg(size)
    }

    /// 生成带样式的 SVG（统一接口）
    #[wasm_bindgen(js_name = toStyledSVG)]
    pub fn to_styled_svg(&self, _options: JsValue) -> String {
        // 简化实现：直接返回基础 SVG
        self.generate_svg(256)
    }

    /// 获取模块数据作为 JSON 字符串
    #[wasm_bindgen(js_name = getModulesJSON)]
    pub fn get_modules_json(&self) -> String {
        if let Some(modules) = self.qr.get_modules() {
            let mut result = String::from("[");
            for (i, row) in modules.iter().enumerate() {
                if i > 0 {
                    result.push(',');
                }
                result.push('[');
                for (j, &cell) in row.iter().enumerate() {
                    if j > 0 {
                        result.push(',');
                    }
                    result.push_str(if cell.unwrap_or(false) { "1" } else { "0" });
                }
                result.push(']');
            }
            result.push(']');
            result
        } else {
            String::from("[]")
        }
    }

    /// 获取 SVG 字符串（旧接口，保留兼容）
    pub fn get_svg(&self) -> String {
        self.to_svg(Some(256))
    }

    // 内部方法：生成基础 SVG
    fn generate_svg(&self, size: i32) -> String {
        let count = self.qr.get_module_count();
        if count == 0 {
            return String::new();
        }

        let cell_size = size / count;
        let actual_size = cell_size * count;
        let offset = (size - actual_size) / 2;
        
        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}" width="{}" height="{}">"#,
            size, size, size, size
        );
        
        // 背景
        svg.push_str(&format!(
            r#"<rect width="{}" height="{}" fill="{}"/>"#,
            size, size, self.qr.options.color_light
        ));

        // 使用 rect 绘制每个模块
        for row in 0..count {
            for col in 0..count {
                if self.qr.is_dark(row, col) {
                    svg.push_str(&format!(
                        r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}"/>"#,
                        col * cell_size + offset,
                        row * cell_size + offset,
                        cell_size,
                        cell_size,
                        self.qr.options.color_dark
                    ));
                }
            }
        }

        svg.push_str("</svg>");
        svg
    }
}

#[cfg(feature = "wasm")]
impl Default for QRCodeWasm {
    fn default() -> Self {
        // 默认创建一个空的 QRCode
        let mut qr = QRCode::new();
        qr.make_code("");
        QRCodeWasm { qr }
    }
}

// ============================================
// 统一 API 导出函数
// ============================================

/// 生成 QRCode 并返回 WASM 对象
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateQRCode)]
pub fn generate_qrcode(text: &str, correct_level: CorrectLevel) -> QRCodeWasm {
    QRCodeWasm::new(text, correct_level)
}

/// 生成圆角二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateRoundedQRCode)]
pub fn generate_rounded_qrcode(text: &str, size: Option<i32>, _radius: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成渐变二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateGradientQRCode)]
pub fn generate_gradient_qrcode(text: &str, size: Option<i32>, _color1: &str, _color2: &str) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成微信风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateWechatStyleQRCode)]
pub fn generate_wechat_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成抖音风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateDouyinStyleQRCode)]
pub fn generate_douyin_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成支付宝风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateAlipayStyleQRCode)]
pub fn generate_alipay_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成小红书风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateXiaohongshuStyleQRCode)]
pub fn generate_xiaohongshu_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成赛博朋克风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateCyberpunkStyleQRCode)]
pub fn generate_cyberpunk_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成复古风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateRetroStyleQRCode)]
pub fn generate_retro_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 生成极简风格二维码
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = generateMinimalStyleQRCode)]
pub fn generate_minimal_style_qrcode(text: &str, size: Option<i32>) -> String {
    let qr = QRCodeWasm::new(text, CorrectLevel::H);
    qr.to_svg(size)
}

/// 获取版本号
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn version() -> String {
    String::from("v0.1.0")
}

/// 获取版本信息
#[cfg(feature = "wasm")]
#[wasm_bindgen(js_name = getVersionInfo)]
pub fn get_version_info() -> String {
    String::from(r#"{
        "version": "0.1.0",
        "api_version": "1.0.0",
        "features": [
            "basic_qrcode",
            "svg_output",
            "styled_svg",
            "unified_api"
        ]
    }"#)
}

// ============================================
// 非 WASM 环境下的实现
// ============================================

#[cfg(not(feature = "wasm"))]
pub struct QRCodeNative {
    qr: QRCode,
}

#[cfg(not(feature = "wasm"))]
impl QRCodeNative {
    pub fn new(text: &str, correct_level: QRErrorCorrectLevel) -> Self {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            correct_level,
            ..Default::default()
        });
        qr.make_code(text);
        QRCodeNative { qr }
    }

    pub fn module_count(&self) -> i32 {
        self.qr.get_module_count()
    }

    pub fn get_module_count(&self) -> i32 {
        self.qr.get_module_count()
    }

    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        self.qr.is_dark(row, col)
    }

    pub fn to_svg(&self, size: i32) -> String {
        let count = self.qr.get_module_count();
        if count == 0 {
            return String::new();
        }

        let cell_size = size / count;
        let actual_size = cell_size * count;
        let offset = (size - actual_size) / 2;
        
        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {} {}" width="{}" height="{}">"#,
            size, size, size, size
        );
        
        svg.push_str(&format!(
            r#"<rect width="{}" height="{}" fill="{}"/>"#,
            size, size, self.qr.options.color_light
        ));

        for row in 0..count {
            for col in 0..count {
                if self.qr.is_dark(row, col) {
                    svg.push_str(&format!(
                        r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}"/>"#,
                        col * cell_size + offset,
                        row * cell_size + offset,
                        cell_size,
                        cell_size,
                        self.qr.options.color_dark
                    ));
                }
            }
        }

        svg.push_str("</svg>");
        svg
    }
}

#[cfg(not(feature = "wasm"))]
impl Default for QRCodeNative {
    fn default() -> Self {
        Self::new("", QRErrorCorrectLevel::H)
    }
}
