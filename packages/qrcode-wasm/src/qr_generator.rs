/*!
 * 优化的 QRCode 生成器
 * 支持实例复用和批量生成
 */

use crate::qr_code::{get_type_number, QRCodeOptions};
use crate::qr_code_model::QRCodeModel;
use crate::qr_rs_block::QRErrorCorrectLevel;
use wasm_bindgen::prelude::*;

/// 可复用的 QRCode 生成器
#[wasm_bindgen]
pub struct QRCodeGenerator {
    options: QRCodeOptions,
    model: Option<QRCodeModel>,
    // 缓存 SVG 模板
    svg_template: String,
}

#[wasm_bindgen]
impl QRCodeGenerator {
    /// 创建新的生成器
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        QRCodeGenerator {
            options: QRCodeOptions::default(),
            model: None,
            svg_template: String::new(),
        }
    }

    /// 使用选项创建
    pub fn with_options(width: i32, height: i32, correct_level: i32) -> Self {
        let level = match correct_level {
            1 => QRErrorCorrectLevel::L,
            0 => QRErrorCorrectLevel::M,
            3 => QRErrorCorrectLevel::Q,
            _ => QRErrorCorrectLevel::H,
        };

        QRCodeGenerator {
            options: QRCodeOptions {
                width,
                height,
                correct_level: level,
                ..Default::default()
            },
            model: None,
            svg_template: String::new(),
        }
    }

    /// 设置选项
    pub fn set_options(&mut self, width: i32, height: i32, correct_level: i32) {
        let level = match correct_level {
            1 => QRErrorCorrectLevel::L,
            0 => QRErrorCorrectLevel::M,
            3 => QRErrorCorrectLevel::Q,
            _ => QRErrorCorrectLevel::H,
        };
        self.options.width = width;
        self.options.height = height;
        self.options.correct_level = level;
    }

    /// 生成 QRCode（复用实例）
    pub fn generate(&mut self, text: &str) -> Result<(), JsValue> {
        let type_number = get_type_number(text, self.options.correct_level);

        // 检查是否可以复用现有模型
        let need_recreate = match &self.model {
            None => true,
            Some(model) => {
                model.type_number != type_number
                    || model.error_correct_level as i32 != self.options.correct_level as i32
            }
        };

        if need_recreate {
            self.model = Some(QRCodeModel::new(type_number, self.options.correct_level));
        }

        if let Some(ref mut model) = self.model {
            model.data_list.clear();
            model.data_cache = None;
            model.add_data(text);
            model.make();
            Ok(())
        } else {
            Err(JsValue::from_str("Failed to create QRCode model"))
        }
    }

    /// 获取模块数量
    pub fn get_module_count(&self) -> i32 {
        self.model.as_ref().map_or(0, |m| m.get_module_count())
    }

    /// 判断指定位置是否为深色
    pub fn is_dark(&self, row: i32, col: i32) -> bool {
        self.model.as_ref().is_some_and(|m| m.is_dark(row, col))
    }

    /// 获取 SVG 字符串（优化版本）
    pub fn get_svg(&self) -> String {
        let count = self.get_module_count();
        if count == 0 {
            return String::new();
        }

        let size = self.options.width.max(self.options.height);
        let cell_size = size / count;
        let actual_size = cell_size * count;
        let offset = (size - actual_size) / 2; // 居中偏移

        // 使用 String::with_capacity 预分配内存
        let estimated_capacity = (count * count * 100) as usize;
        let mut svg = String::with_capacity(estimated_capacity);

        // SVG 头部
        svg.push_str(&format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {0} {0}" width="{0}" height="{0}">"#,
            size
        ));

        // 背景
        svg.push_str(&format!(
            r#"<rect width="{0}" height="{0}" fill="{1}"/>"#,
            size, self.options.color_light
        ));

        // 使用 rect 绘制每个模块，确保定位图案正确显示
        for row in 0..count {
            for col in 0..count {
                if self.is_dark(row, col) {
                    svg.push_str(&format!(
                        r#"<rect x="{}" y="{}" width="{}" height="{}" fill="{}"/>"#,
                        col * cell_size + offset,
                        row * cell_size + offset,
                        cell_size,
                        cell_size,
                        self.options.color_dark
                    ));
                }
            }
        }

        svg.push_str("</svg>");
        svg
    }

    /// 获取模块数据作为 JSON
    pub fn get_modules_json(&self) -> String {
        if let Some(ref model) = self.model {
            let mut result =
                String::with_capacity((model.module_count * model.module_count * 2) as usize);
            result.push('[');
            for (i, row) in model.modules.iter().enumerate() {
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

    /// 批量生成 QRCode
    pub fn generate_batch(&mut self, texts: Vec<String>) -> Vec<String> {
        let mut results = Vec::with_capacity(texts.len());

        for text in texts {
            if self.generate(&text).is_ok() {
                results.push(self.get_svg());
            } else {
                results.push(String::new());
            }
        }

        results
    }

    /// 生成并返回 Uint8Array（原始模块数据）
    pub fn get_modules_raw(&self) -> Option<Vec<u8>> {
        self.model.as_ref().map(|model| {
            let count = model.module_count as usize;
            let mut data = Vec::with_capacity(count * count);
            for row in &model.modules {
                for &cell in row {
                    data.push(if cell.unwrap_or(false) { 1 } else { 0 });
                }
            }
            data
        })
    }

    /// 清除缓存
    pub fn clear(&mut self) {
        self.model = None;
        self.svg_template.clear();
    }
}

impl Default for QRCodeGenerator {
    fn default() -> Self {
        Self::new()
    }
}

/// 批量生成工具函数
#[wasm_bindgen]
pub fn generate_qrcode_batch(texts: Vec<String>, correct_level: i32) -> Vec<String> {
    let level = match correct_level {
        1 => QRErrorCorrectLevel::L,
        0 => QRErrorCorrectLevel::M,
        3 => QRErrorCorrectLevel::Q,
        _ => QRErrorCorrectLevel::H,
    };

    let mut generator = QRCodeGenerator::with_options(256, 256, level as i32);
    generator.generate_batch(texts)
}

/// 快速生成单个 QRCode
#[wasm_bindgen]
pub fn generate_qrcode_fast(text: &str, size: i32) -> String {
    let mut generator = QRCodeGenerator::with_options(size, size, 2);
    if generator.generate(text).is_ok() {
        generator.get_svg()
    } else {
        String::new()
    }
}

/// 并行生成多个 QRCode（使用 Rayon）
#[cfg(feature = "parallel")]
#[wasm_bindgen]
pub fn generate_qrcode_parallel(texts: Vec<String>, size: i32) -> Vec<String> {
    use rayon::prelude::*;

    texts
        .par_iter()
        .map(|text| {
            let mut generator = QRCodeGenerator::with_options(size, size, 2);
            generator.generate(text).ok();
            generator.get_svg()
        })
        .collect()
}

/// 检查是否支持并行
#[wasm_bindgen]
pub fn is_parallel_supported() -> bool {
    cfg!(feature = "parallel")
}
