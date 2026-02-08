/*!
 * Canvas 渲染器
 * 直接操作 Canvas 像素数据，避免创建 SVG 字符串
 */

use crate::qr_code::get_type_number;
use crate::qr_code_model::QRCodeModel;
use crate::qr_rs_block::QRErrorCorrectLevel;
use wasm_bindgen::prelude::*;

/// Canvas 渲染器
#[wasm_bindgen]
pub struct CanvasRenderer {
    width: u32,
    height: u32,
    color_dark: [u8; 4],
    color_light: [u8; 4],
}

#[wasm_bindgen]
impl CanvasRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        CanvasRenderer {
            width,
            height,
            color_dark: [0, 0, 0, 255],        // 黑色
            color_light: [255, 255, 255, 255], // 白色
        }
    }

    /// 设置颜色 (RGBA)
    #[allow(clippy::too_many_arguments)]
    pub fn set_colors(
        &mut self,
        dark_r: u8,
        dark_g: u8,
        dark_b: u8,
        dark_a: u8,
        light_r: u8,
        light_g: u8,
        light_b: u8,
        light_a: u8,
    ) {
        self.color_dark = [dark_r, dark_g, dark_b, dark_a];
        self.color_light = [light_r, light_g, light_b, light_a];
    }

    /// 生成 QRCode 并返回像素数据 (RGBA)
    /// 返回 Uint8Array，可以直接用于 ImageData
    pub fn render(&self, text: &str, correct_level: i32) -> Result<Vec<u8>, JsValue> {
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

        let module_count = model.get_module_count() as u32;
        let cell_size = self.width / module_count;

        // 创建像素缓冲区
        let mut pixels = vec![0u8; (self.width * self.height * 4) as usize];

        // 填充背景色
        for y in 0..self.height {
            for x in 0..self.width {
                let idx = ((y * self.width + x) * 4) as usize;
                pixels[idx] = self.color_light[0];
                pixels[idx + 1] = self.color_light[1];
                pixels[idx + 2] = self.color_light[2];
                pixels[idx + 3] = self.color_light[3];
            }
        }

        // 绘制 QRCode 模块
        for row in 0..module_count {
            for col in 0..module_count {
                if model.is_dark(row as i32, col as i32) {
                    let start_y = row * cell_size;
                    let start_x = col * cell_size;

                    for dy in 0..cell_size {
                        for dx in 0..cell_size {
                            let y = start_y + dy;
                            let x = start_x + dx;

                            if y < self.height && x < self.width {
                                let idx = ((y * self.width + x) * 4) as usize;
                                pixels[idx] = self.color_dark[0];
                                pixels[idx + 1] = self.color_dark[1];
                                pixels[idx + 2] = self.color_dark[2];
                                pixels[idx + 3] = self.color_dark[3];
                            }
                        }
                    }
                }
            }
        }

        Ok(pixels)
    }

    /// 生成带边距的 QRCode 像素数据
    pub fn render_with_quiet_zone(
        &self,
        text: &str,
        correct_level: i32,
        quiet_zone: u32,
    ) -> Result<Vec<u8>, JsValue> {
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

        let module_count = model.get_module_count() as u32;
        let total_modules = module_count + quiet_zone * 2;
        let cell_size = self.width / total_modules;

        let mut pixels = vec![0u8; (self.width * self.height * 4) as usize];

        // 填充背景
        for y in 0..self.height {
            for x in 0..self.width {
                let idx = ((y * self.width + x) * 4) as usize;
                pixels[idx] = self.color_light[0];
                pixels[idx + 1] = self.color_light[1];
                pixels[idx + 2] = self.color_light[2];
                pixels[idx + 3] = self.color_light[3];
            }
        }

        // 绘制 QRCode
        for row in 0..module_count {
            for col in 0..module_count {
                if model.is_dark(row as i32, col as i32) {
                    let start_y = (row + quiet_zone) * cell_size;
                    let start_x = (col + quiet_zone) * cell_size;

                    for dy in 0..cell_size {
                        for dx in 0..cell_size {
                            let y = start_y + dy;
                            let x = start_x + dx;

                            if y < self.height && x < self.width {
                                let idx = ((y * self.width + x) * 4) as usize;
                                pixels[idx] = self.color_dark[0];
                                pixels[idx + 1] = self.color_dark[1];
                                pixels[idx + 2] = self.color_dark[2];
                                pixels[idx + 3] = self.color_dark[3];
                            }
                        }
                    }
                }
            }
        }

        Ok(pixels)
    }

    /// 获取推荐的 Canvas 尺寸
    pub fn get_recommended_size(module_count: u32, cell_size: u32) -> u32 {
        module_count * cell_size
    }
}

impl Default for CanvasRenderer {
    fn default() -> Self {
        Self::new(256, 256)
    }
}

/// 快速渲染函数
#[wasm_bindgen]
pub fn render_qrcode_to_pixels(text: &str, width: u32, height: u32) -> Vec<u8> {
    let renderer = CanvasRenderer::new(width, height);
    renderer.render(text, 2).unwrap_or_default()
}

/// 批量渲染到像素数组 (返回 js_sys::Array)
#[wasm_bindgen]
pub fn render_qrcode_batch_pixels(texts: Vec<String>, width: u32, height: u32) -> js_sys::Array {
    let renderer = CanvasRenderer::new(width, height);
    let result = js_sys::Array::new();
    for text in texts {
        let pixels = renderer.render(&text, 2).unwrap_or_default();
        result.push(&js_sys::Uint8Array::from(&pixels[..]));
    }
    result
}
