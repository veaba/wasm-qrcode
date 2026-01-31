/**
 * 样式化 QRCode 生成器
 * 支持 Logo、圆角、渐变等效果
 */

use crate::qr_code::get_type_number;
use crate::qr_code_model::QRCodeModel;
use crate::qr_rs_block::QRErrorCorrectLevel;
use wasm_bindgen::prelude::*;

/// QRCode 样式选项
#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct QRCodeStyle {
    width: i32,
    height: i32,
    color_dark: String,
    color_light: String,
    // 圆角半径 (0 = 方形)
    border_radius: i32,
    // 是否添加 Logo
    has_logo: bool,
    // Logo 大小比例 (0.0 - 0.5)
    logo_ratio: f64,
    // 是否使用渐变
    use_gradient: bool,
    // 渐变颜色
    gradient_color1: String,
    gradient_color2: String,
    // 边距
    quiet_zone: i32,
}

#[wasm_bindgen]
impl QRCodeStyle {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        QRCodeStyle {
            width: 256,
            height: 256,
            color_dark: "#000000".to_string(),
            color_light: "#ffffff".to_string(),
            border_radius: 0,
            has_logo: false,
            logo_ratio: 0.2,
            use_gradient: false,
            gradient_color1: "#000000".to_string(),
            gradient_color2: "#333333".to_string(),
            quiet_zone: 4,
        }
    }

    // Setters
    pub fn set_size(&mut self, size: i32) {
        self.width = size;
        self.height = size;
    }

    pub fn set_colors(&mut self, dark: &str, light: &str) {
        self.color_dark = dark.to_string();
        self.color_light = light.to_string();
    }

    pub fn set_border_radius(&mut self, radius: i32) {
        self.border_radius = radius;
    }

    pub fn set_logo(&mut self, enabled: bool, ratio: f64) {
        self.has_logo = enabled;
        self.logo_ratio = ratio.clamp(0.0, 0.5);
    }

    pub fn set_gradient(&mut self, enabled: bool, color1: &str, color2: &str) {
        self.use_gradient = enabled;
        self.gradient_color1 = color1.to_string();
        self.gradient_color2 = color2.to_string();
    }

    pub fn set_quiet_zone(&mut self, zone: i32) {
        self.quiet_zone = zone;
    }
}

impl Default for QRCodeStyle {
    fn default() -> Self {
        Self::new()
    }
}

/// 样式化 QRCode 生成器
#[wasm_bindgen]
pub struct StyledQRCode {
    style: QRCodeStyle,
    model: Option<QRCodeModel>,
}

#[wasm_bindgen]
impl StyledQRCode {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        StyledQRCode {
            style: QRCodeStyle::new(),
            model: None,
        }
    }

    pub fn with_style(style: QRCodeStyle) -> Self {
        StyledQRCode {
            style,
            model: None,
        }
    }

    /// 生成 QRCode
    pub fn generate(&mut self, text: &str, correct_level: i32) -> Result<(), JsValue> {
        let level = match correct_level {
            1 => QRErrorCorrectLevel::L,
            0 => QRErrorCorrectLevel::M,
            3 => QRErrorCorrectLevel::Q,
            _ => QRErrorCorrectLevel::H,
        };

        let type_number = get_type_number(text, level);
        
        let mut model = QRCodeModel::new(type_number, level);
        model.add_data(text);
        model.make();
        
        self.model = Some(model);
        Ok(())
    }

    /// 获取 SVG（带样式）
    pub fn get_styled_svg(&self) -> String {
        if self.model.is_none() {
            return String::new();
        }

        let model = self.model.as_ref().unwrap();
        let count = model.module_count;
        let quiet_zone = self.style.quiet_zone;
        let total_count = count + quiet_zone * 2;
        
        let size = self.style.width;
        let cell_size = size / total_count;
        let actual_size = cell_size * total_count;
        let offset = (size - actual_size) / 2; // 居中偏移

        let mut svg = String::with_capacity(10000);
        
        // SVG 头部
        svg.push_str(&format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {0}" width="{0}" height="{0}">"#,
            size
        ));

        // 定义渐变
        if self.style.use_gradient {
            svg.push_str(&format!(
                r#"<defs>
                <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:{}" />
                    <stop offset="100%" style="stop-color:{}" />
                </linearGradient>
            </defs>"#,
                self.style.gradient_color1, self.style.gradient_color2
            ));
        }

        // 背景
        svg.push_str(&format!(
            r#"<rect width="{0}" height="{0}" fill="{1}" rx="{2}" ry="{2}"/>"#,
            size, self.style.color_light, self.style.border_radius
        ));

        // 计算填充颜色
        let fill_color = if self.style.use_gradient {
            "url(#qrGradient)"
        } else {
            &self.style.color_dark
        };

        // 如果有 Logo，计算 Logo 区域
        let logo_area = if self.style.has_logo {
            let logo_cells = (count as f64 * self.style.logo_ratio) as i32;
            let logo_start = (count - logo_cells) / 2;
            let logo_end = logo_start + logo_cells;
            Some((logo_start, logo_end))
        } else {
            None
        };

        // 绘制模块
        if self.style.border_radius > 0 {
            // 使用圆角矩形
            for row in 0..count {
                for col in 0..count {
                    // 跳过 Logo 区域
                    if let Some((start, end)) = logo_area {
                        if row >= start && row < end && col >= start && col < end {
                            continue;
                        }
                    }

                    if model.is_dark(row, col) {
                        let x = (col + quiet_zone) * cell_size + offset;
                        let y = (row + quiet_zone) * cell_size + offset;
                        let radius = self.style.border_radius.min(cell_size / 4);
                    svg.push_str(&format!(
                            r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}" rx="{}" ry="{}"/>"#,
                            x, y, cell_size, cell_size, fill_color, radius, radius
                        ));
                    }
                }
            }
        } else {
            // 使用 rect 绘制每个模块，确保定位图案正确显示
            for row in 0..count {
                for col in 0..count {
                    // 跳过 Logo 区域
                    if let Some((start, end)) = logo_area {
                        if row >= start && row < end && col >= start && col < end {
                            continue;
                        }
                    }

                    if model.is_dark(row, col) {
                        let x = (col + quiet_zone) * cell_size + offset;
                        let y = (row + quiet_zone) * cell_size + offset;
                        svg.push_str(&format!(
                            r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}"/>"#,
                            x, y, cell_size, cell_size, fill_color
                        ));
                    }
                }
            }
        }

        // 如果有 Logo，添加 Logo 占位区域
        if self.style.has_logo {
            if let Some((start, end)) = logo_area {
                let logo_x = (start + quiet_zone) * cell_size + offset;
                let logo_y = (start + quiet_zone) * cell_size + offset;
                let logo_size = (end - start) * cell_size;
                
                // Logo 背景
                svg.push_str(&format!(
                    r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}" rx="{}"/>"#,
                    logo_x, logo_y, logo_size, logo_size, 
                    self.style.color_light, cell_size
                ));
                
                // Logo 边框
                svg.push_str(&format!(
                    r#"<rect x="{}" y="{}" width="{}" height="{}" fill="none" stroke="{}" stroke-width="{}" rx="{}"/>"#,
                    logo_x + cell_size, logo_y + cell_size, 
                    logo_size - 2 * cell_size, logo_size - 2 * cell_size,
                    self.style.color_dark, cell_size / 2, cell_size
                ));
            }
        }

        svg.push_str("</svg>");
        svg
    }

    /// 获取模块数量
    pub fn get_module_count(&self) -> i32 {
        self.model.as_ref().map_or(0, |m| m.get_module_count())
    }

    /// 获取 Logo 区域信息（用于外部添加 Logo）
    pub fn get_logo_area(&self) -> Option<Vec<i32>> {
        if !self.style.has_logo {
            return None;
        }

        let count = self.get_module_count();
        let logo_cells = (count as f64 * self.style.logo_ratio) as i32;
        let logo_start = (count - logo_cells) / 2;
        let cell_size = self.style.width / (count + self.style.quiet_zone * 2);
        
        Some(vec![
            logo_start * cell_size,
            logo_start * cell_size,
            logo_cells * cell_size,
            logo_cells * cell_size,
        ])
    }
}

impl Default for StyledQRCode {
    fn default() -> Self {
        Self::new()
    }
}

/// 快速生成圆角 QRCode
#[wasm_bindgen]
pub fn generate_rounded_qrcode(text: &str, size: i32, radius: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_border_radius(radius);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 快速生成带 Logo 区域的 QRCode
#[wasm_bindgen]
pub fn generate_qrcode_with_logo_area(text: &str, size: i32, logo_ratio: f64) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_logo(true, logo_ratio);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 快速生成渐变 QRCode
#[wasm_bindgen]
pub fn generate_gradient_qrcode(text: &str, size: i32, color1: &str, color2: &str) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_gradient(true, color1, color2);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 微信样式 QRCode - 绿色主题
#[wasm_bindgen]
pub fn generate_wechat_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#07C160", "#ffffff");
    style.set_border_radius(4);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 抖音样式 QRCode - 黑色背景，青色/洋红渐变
#[wasm_bindgen]
pub fn generate_douyin_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#00F2EA", "#000000");
    style.set_gradient(true, "#00F2EA", "#FF0050");
    style.set_border_radius(6);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 支付宝样式 QRCode - 蓝色主题
#[wasm_bindgen]
pub fn generate_alipay_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#1677FF", "#ffffff");
    style.set_border_radius(8);
    style.set_logo(true, 0.15);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 小红书样式 QRCode - 红色主题
#[wasm_bindgen]
pub fn generate_xiaohongshu_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#FF2442", "#ffffff");
    style.set_border_radius(12);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 赛博朋克样式 QRCode - 霓虹效果
#[wasm_bindgen]
pub fn generate_cyberpunk_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#FF00FF", "#0a0a0a");
    style.set_gradient(true, "#FF00FF", "#00FFFF");
    style.set_border_radius(2);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 复古样式 QRCode -  sepia 色调
#[wasm_bindgen]
pub fn generate_retro_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#8B4513", "#F5F5DC");
    style.set_border_radius(0);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}

/// 极简样式 QRCode - 细边框，大圆角
#[wasm_bindgen]
pub fn generate_minimal_style_qrcode(text: &str, size: i32) -> String {
    let mut style = QRCodeStyle::new();
    style.set_size(size);
    style.set_colors("#333333", "#fafafa");
    style.set_border_radius(16);
    style.set_quiet_zone(2);
    
    let mut qr = StyledQRCode::with_style(style);
    if qr.generate(text, 2).is_ok() {
        qr.get_styled_svg()
    } else {
        String::new()
    }
}
