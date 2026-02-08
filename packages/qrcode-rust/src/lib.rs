//! @veaba/qrcode-rust - Pure Rust QRCode Generator
//!
//! A pure Rust QRCode generator library.
//! Provides consistent API with qrcode-node and qrcode-bun.

// 本地模块：核心 QRCode 实现（特有，不共享）
mod qr_code;

// 从 rust-shared 重新导出
pub use rust_shared::{
    qr_8bit_byte::QR8bitByte,
    qr_bit_buffer::BitBuffer,
    qr_code_model::{get_type_number, QRErrorCorrectLevel, QRMode, PATTERN_POSITION_TABLE},
    qr_math::QRMath,
    qr_polynomial::Polynomial,
    qr_rs_block::{get_rs_blocks, QRRSBlock},
    qr_util::{get_bch_digit, get_length_in_bits},
};

// 重新导出本地模块
pub use qr_code::{QRCode, QRCodeOptions};

// ============================================
// QRCode Native 包装器
// ============================================

pub struct QRCodeNative {
    qr: QRCode,
}

impl QRCodeNative {
    pub fn new(text: &str, correct_level: QRErrorCorrectLevel) -> Self {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level,
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

impl Default for QRCodeNative {
    fn default() -> Self {
        Self::new("", QRErrorCorrectLevel::H)
    }
}

// ============================================
// 集成测试
// ============================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qrcode_basic_creation() {
        let mut qr = QRCode::new();
        qr.make_code("Hello World");

        assert!(qr.module_count > 0, "模块数应该大于 0");
        assert!(qr.type_number > 0, "类型号应该大于 0");

        // 检查 data_cache
        if let Some(ref data) = qr.data_cache {
            println!("\n=== test_qrcode_basic_creation ===");
            println!("data_cache 长度: {} 字节", data.len());
            println!("期望: 16 字节数据 + 28 字节纠错 = 44 字节 (版本 2-H)");
            println!("数据部分 (前 16 字节):");
            for (i, byte) in data.iter().enumerate().take(16) {
                println!("  [{:2}] = 0x{:02X}", i, byte);
            }
            println!("纠错码部分 (后 28 字节):");
            for (i, byte) in data.iter().enumerate().skip(16) {
                println!("  [{:2}] = 0x{:02X}", i, byte);
            }
        }
    }

    #[test]
    fn test_qrcode_with_options() {
        let mut qr = QRCode::with_options(QRCodeOptions {
            width: 256,
            height: 256,
            color_dark: String::from("#000000"),
            color_light: String::from("#ffffff"),
            correct_level: QRErrorCorrectLevel::H,
        });
        qr.make_code("Test");

        assert_eq!(qr.options.color_dark, "#000000");
        assert_eq!(qr.options.color_light, "#ffffff");
    }

    #[test]
    fn test_qrcode_is_dark_in_range() {
        let mut qr = QRCode::new();
        qr.make_code("Test");

        let count = qr.module_count;

        // 测试边界内的访问
        for row in 0..count {
            for col in 0..count {
                let _ = qr.is_dark(row, col);
            }
        }
    }

    #[test]
    #[should_panic]
    fn test_qrcode_is_dark_out_of_range() {
        let mut qr = QRCode::new();
        qr.make_code("Test");

        let count = qr.module_count;
        // 这应该 panic
        qr.is_dark(count, 0);
    }

    #[test]
    fn test_qrcode_svg_generation() {
        let mut qr = QRCode::new();
        qr.make_code("Hello");

        let svg = qr.get_svg();

        assert!(!svg.is_empty(), "SVG 不应该为空");
        assert!(svg.contains("<svg"), "SVG 应该包含 <svg 标签");
        assert!(svg.contains("</svg>"), "SVG 应该包含 </svg> 标签");
    }

    #[test]
    fn test_qrcode_position_detection_patterns() {
        // 测试位置探测图案是否正确
        let mut qr = QRCode::new();
        qr.make_code("Test");

        let count = qr.module_count;

        // 左上角位置探测图案的角落应该是深色的
        assert!(qr.is_dark(0, 0), "左上角 (0,0) 应该是深色");
        assert!(qr.is_dark(0, 6), "左上角 (0,6) 应该是深色");
        assert!(qr.is_dark(6, 0), "左上角 (6,0) 应该是深色");
        assert!(qr.is_dark(6, 6), "左上角 (6,6) 应该是深色");

        // 右上角位置探测图案
        assert!(
            qr.is_dark(0, count - 1),
            "右上角 (0,{}) 应该是深色",
            count - 1
        );
        assert!(
            qr.is_dark(0, count - 7),
            "右上角 (0,{}) 应该是深色",
            count - 7
        );
        assert!(
            qr.is_dark(6, count - 1),
            "右上角 (6,{}) 应该是深色",
            count - 1
        );
        assert!(
            qr.is_dark(6, count - 7),
            "右上角 (6,{}) 应该是深色",
            count - 7
        );

        // 左下角位置探测图案
        assert!(
            qr.is_dark(count - 1, 0),
            "左下角 ({},0) 应该是深色",
            count - 1
        );
        assert!(
            qr.is_dark(count - 7, 0),
            "左下角 ({},0) 应该是深色",
            count - 7
        );
        assert!(
            qr.is_dark(count - 1, 6),
            "左下角 ({},6) 应该是深色",
            count - 1
        );
        assert!(
            qr.is_dark(count - 7, 6),
            "左下角 ({},6) 应该是深色",
            count - 7
        );
    }

    #[test]
    fn test_qrcode_timing_patterns() {
        // 测试定时图案
        let mut qr = QRCode::new();
        qr.make_code("Test");

        let count = qr.module_count;

        // 水平定时图案应该在第 6 行，从第 8 列开始
        for col in 8..count - 8 {
            let expected = col % 2 == 0;
            assert_eq!(
                qr.is_dark(6, col),
                expected,
                "水平定时图案在 (6,{}) 不匹配",
                col
            );
        }

        // 垂直定时图案应该在第 6 列，从第 8 行开始
        for row in 8..count - 8 {
            let expected = row % 2 == 0;
            assert_eq!(
                qr.is_dark(row, 6),
                expected,
                "垂直定时图案在 ({},6) 不匹配",
                row
            );
        }
    }

    #[test]
    fn test_different_error_correction_levels() {
        let test_data = "Hello World";

        for level in [
            QRErrorCorrectLevel::L,
            QRErrorCorrectLevel::M,
            QRErrorCorrectLevel::Q,
            QRErrorCorrectLevel::H,
        ] {
            let mut qr = QRCode::with_options(QRCodeOptions {
                width: 256,
                height: 256,
                color_dark: String::from("#000000"),
                color_light: String::from("#ffffff"),
                correct_level: level,
            });
            qr.make_code(test_data);

            assert!(
                qr.module_count > 0,
                "纠错级别 {:?} 应该生成有效的二维码",
                level
            );
        }
    }

    #[test]
    fn test_empty_string() {
        let mut qr = QRCode::new();
        qr.make_code("");

        assert!(qr.module_count > 0, "空字符串也应该生成二维码");
    }

    #[test]
    fn test_long_text() {
        let long_text = "a".repeat(100);
        let mut qr = QRCode::new();
        qr.make_code(&long_text);

        assert!(qr.module_count > 0, "长文本应该生成二维码");
        assert!(qr.type_number > 1, "长文本应该使用更高的类型号");
    }

    #[test]
    fn test_complex_text_hello_world_123() {
        // 测试复杂文本 "Test QR Code 123"
        let text = "Test QR Code 123";
        let mut qr = QRCode::new();
        qr.make_code(text);

        assert!(qr.module_count > 0, "复杂文本应该生成二维码");
        assert!(qr.type_number >= 2, "此文本应该使用类型号 >= 2");

        // 打印调试信息
        println!("\n=== test_complex_text_hello_world_123 (qrcode-rust) ===");
        println!("文本: {}", text);
        println!("类型号: {}", qr.type_number);
        println!("模块数: {}", qr.module_count);

        // 检查 data_cache
        if let Some(ref data) = qr.data_cache {
            println!("data_cache 长度: {} 字节", data.len());
            println!("数据字节 (前 32 字节):");
            for (i, byte) in data.iter().enumerate().take(32) {
                print!("{:02X} ", byte);
                if (i + 1) % 16 == 0 {
                    println!();
                }
            }
            println!();
        }
    }

    #[test]
    fn test_complex_text_various() {
        // 测试多种复杂文本
        let test_cases = vec![
            "Test QR Code 123",
            "Hello World! 2024",
            "https://example.com/path?query=1&foo=bar",
            "Email: test@example.com | Phone: +1-234-567-8900",
            "WiFi:T:WPA;S:MyNetwork;P:MyPassword;;",
        ];

        for text in test_cases {
            let mut qr = QRCode::new();
            qr.make_code(text);

            assert!(qr.module_count > 0, "文本 '{}' 应该生成二维码", text);
            println!(
                "文本 '{}' -> 类型号 {}, 模块数 {}",
                text, qr.type_number, qr.module_count
            );
        }
    }

    #[test]
    fn test_get_rs_blocks() {
        // 测试类型号 1，所有纠错级别
        for level in [
            QRErrorCorrectLevel::L,
            QRErrorCorrectLevel::M,
            QRErrorCorrectLevel::Q,
            QRErrorCorrectLevel::H,
        ] {
            let blocks = get_rs_blocks(1, level);
            assert!(
                !blocks.is_empty(),
                "类型号 1 纠错级别 {:?} 应该有 RS 块",
                level
            );
        }

        // 测试类型号 2，所有纠错级别
        for level in [
            QRErrorCorrectLevel::L,
            QRErrorCorrectLevel::M,
            QRErrorCorrectLevel::Q,
            QRErrorCorrectLevel::H,
        ] {
            let blocks = get_rs_blocks(2, level);
            assert!(
                !blocks.is_empty(),
                "类型号 2 纠错级别 {:?} 应该有 RS 块",
                level
            );
        }
    }
}
