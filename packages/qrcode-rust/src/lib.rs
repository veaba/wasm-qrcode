//! @veaba/qrcode-rust - Pure Rust QRCode Generator
//! 
//! A pure Rust QRCode generator library.
//! Provides consistent API with qrcode-node and qrcode-bun.

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
        assert!(qr.is_dark(0, count - 1), "右上角 (0,{}) 应该是深色", count - 1);
        assert!(qr.is_dark(0, count - 7), "右上角 (0,{}) 应该是深色", count - 7);
        assert!(qr.is_dark(6, count - 1), "右上角 (6,{}) 应该是深色", count - 1);
        assert!(qr.is_dark(6, count - 7), "右上角 (6,{}) 应该是深色", count - 7);
        
        // 左下角位置探测图案
        assert!(qr.is_dark(count - 1, 0), "左下角 ({},0) 应该是深色", count - 1);
        assert!(qr.is_dark(count - 7, 0), "左下角 ({},0) 应该是深色", count - 7);
        assert!(qr.is_dark(count - 1, 6), "左下角 ({},6) 应该是深色", count - 1);
        assert!(qr.is_dark(count - 7, 6), "左下角 ({},6) 应该是深色", count - 7);
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
            assert_eq!(qr.is_dark(6, col), expected, "水平定时图案在 (6,{}) 不匹配", col);
        }
        
        // 垂直定时图案应该在第 6 列，从第 8 行开始
        for row in 8..count - 8 {
            let expected = row % 2 == 0;
            assert_eq!(qr.is_dark(row, 6), expected, "垂直定时图案在 ({},6) 不匹配", row);
        }
    }

    #[test]
    fn test_different_error_correction_levels() {
        let test_data = "Hello World";
        
        for level in [QRErrorCorrectLevel::L, QRErrorCorrectLevel::M, 
                      QRErrorCorrectLevel::Q, QRErrorCorrectLevel::H] {
            let mut qr = QRCode::with_options(QRCodeOptions {
                width: 256,
                height: 256,
                color_dark: String::from("#000000"),
                color_light: String::from("#ffffff"),
                correct_level: level,
            });
            qr.make_code(test_data);
            
            assert!(qr.module_count > 0, "纠错级别 {:?} 应该生成有效的二维码", level);
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
            println!("文本 '{}' -> 类型号 {}, 模块数 {}", text, qr.type_number, qr.module_count);
        }
    }

    #[test]
    fn test_get_rs_blocks() {
        use qr_rs_block::get_rs_blocks;
        
        // 测试类型号 1，所有纠错级别
        for level in [QRErrorCorrectLevel::L, QRErrorCorrectLevel::M,
                      QRErrorCorrectLevel::Q, QRErrorCorrectLevel::H] {
            let blocks = get_rs_blocks(1, level);
            assert!(!blocks.is_empty(), "类型号 1 纠错级别 {:?} 应该有 RS 块", level);
        }
        
        // 测试类型号 2，所有纠错级别
        for level in [QRErrorCorrectLevel::L, QRErrorCorrectLevel::M,
                      QRErrorCorrectLevel::Q, QRErrorCorrectLevel::H] {
            let blocks = get_rs_blocks(2, level);
            assert!(!blocks.is_empty(), "类型号 2 纠错级别 {:?} 应该有 RS 块", level);
        }
    }

    #[test]
    fn test_debug_mod_with_shift_real() {
        use qr_polynomial::Polynomial;
        
        // 测试版本 2-M 的数据
        let data = vec![
            0x40, 0xB4, 0x86, 0x56, 0xC6, 0xC6, 0xF2, 0x05,
            0x76, 0xF7, 0x26, 0xC6, 0x40, 0xEC, 0x11, 0xEC,
            0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC, 0x11, 0xEC,
            0x11, 0xEC, 0x11, 0xEC
        ];
        let ec_count = 16;
        
        let rs_poly = Polynomial::generate_rs_poly(ec_count);
        let raw_poly = Polynomial::new(data.clone(), 0);
        let mod_poly = raw_poly.r#mod_with_shift(&rs_poly, ec_count);
        
        println!("\n=== test_debug_mod_with_shift_real ===");
        println!("数据长度: {} 字节", data.len());
        println!("生成多项式长度: {} 系数", rs_poly.len());
        println!("mod_poly 长度: {} 系数", mod_poly.len());
        println!("Rust 纠错码 (16 字节):");
        for i in 0..ec_count {
            print!("{:02X} ", mod_poly.get(i as usize));
        }
        println!();
        println!("Python 纠错码 (16 字节): 2C FA CE 06 79 14 DA 8B 77 6B FB 17 7A 38 EB 98");
    }

    #[test]
    fn test_debug_mod_with_shift() {
        use qr_polynomial::Polynomial;
        
        // 简单测试: [1, 2, 3] mod g(x) with shift
        let data = vec![1, 2, 3];
        let rs_poly = Polynomial::generate_rs_poly(4);
        let raw_poly = Polynomial::new(data.clone(), 0);
        let mod_poly = raw_poly.r#mod_with_shift(&rs_poly, 4);
        
        println!("\n=== test_debug_mod_with_shift ===");
        println!("数据: {:?}", data);
        println!("生成多项式 ({} 系数):", rs_poly.len());
        for i in 0..rs_poly.len() {
            println!("  g[{}] = {}", i, rs_poly.get(i));
        }
        println!("mod_poly ({} 系数):", mod_poly.len());
        for i in 0..mod_poly.len() {
            println!("  mod[{}] = {}", i, mod_poly.get(i));
        }
    }

    #[test]
    fn test_debug_rs_blocks_v2h() {
        use qr_rs_block::get_rs_blocks;
        
        let blocks = get_rs_blocks(2, QRErrorCorrectLevel::H);
        println!("\n=== RS 块信息 (版本 2-H) ===");
        println!("块数: {}", blocks.len());
        for (i, block) in blocks.iter().enumerate() {
            println!("  块 {}: total_count={}, data_count={}", i, block.total_count, block.data_count);
        }
    }

    #[test]
    fn test_debug_rs_blocks() {
        use qr_rs_block::get_rs_blocks;
        
        let blocks = get_rs_blocks(2, QRErrorCorrectLevel::M);
        println!("\n=== RS 块信息 (版本 2-M) ===");
        println!("块数: {}", blocks.len());
        for (i, block) in blocks.iter().enumerate() {
            println!("  块 {}: total_count={}, data_count={}", i, block.total_count, block.data_count);
        }
    }

    #[test]
    fn test_debug_create_data() {
        use qr_bit_buffer::BitBuffer;
        use qr_8bit_byte::QR8bitByte;
        use qr_util::get_length_in_bits;
        use qr_rs_block::get_rs_blocks;
        use qr_polynomial::Polynomial;
        
        let text = "Hello World";
        let type_number = 2;
        let correct_level = QRErrorCorrectLevel::M;
        
        // 重新实现 create_data 的逻辑来调试
        let rs_blocks = get_rs_blocks(type_number, correct_level);
        let mut buffer = BitBuffer::new();
        
        let data = QR8bitByte::new(text);
        buffer.put(QRMode::MODE_8BIT_BYTE, 4);
        buffer.put(data.get_length() as i32, get_length_in_bits(QRMode::MODE_8BIT_BYTE, type_number));
        data.write(&mut buffer);
        
        let mut total_data_count = 0;
        for block in &rs_blocks {
            total_data_count += block.data_count;
        }
        
        if buffer.length + 4 <= total_data_count as usize * 8 {
            buffer.put(0, 4);
        }
        
        while !buffer.length.is_multiple_of(8) {
            buffer.put_bit(false);
        }
        
        loop {
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0xEC, 8);
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0x11, 8);
        }
        
        println!("\n=== create_data 调试 ===");
        println!("buffer.buffer 长度: {}", buffer.buffer.len());
        println!("total_data_count: {}", total_data_count);
        
        let data_bytes = &buffer.buffer;
        let mut offset = 0;
        
        for (block_idx, block) in rs_blocks.iter().enumerate() {
            let dc_count = block.data_count;
            let ec_count = block.total_count - block.data_count;
            
            println!("\n块 {}:", block_idx);
            println!("  dc_count={}, ec_count={}", dc_count, ec_count);
            
            let dc = &data_bytes[offset as usize..(offset + dc_count) as usize];
            offset += dc_count;
            
            println!("  数据字节 ({}): {:?}", dc.len(), dc);
            
            let rs_poly = Polynomial::generate_rs_poly(ec_count);
            let raw_poly = Polynomial::new(dc.to_vec(), 0);
            let mod_poly = raw_poly.r#mod_with_shift(&rs_poly, ec_count);
            
            println!("  生成多项式长度: {}", rs_poly.len());
            println!("  mod_poly 长度: {}", mod_poly.len());
            
            let mut ec = Vec::new();
            for i in 0..ec_count {
                ec.push(mod_poly.get(i as usize));
            }
            println!("  纠错码 ({}): {:?}", ec.len(), ec);
        }
    }

    #[test]
    fn test_debug_data_encoding() {
        // 调试测试：打印 "Hello World" 的数据编码
        use qr_bit_buffer::BitBuffer;
        use qr_8bit_byte::QR8bitByte;
        use qr_util::get_length_in_bits;
        
        let text = "Hello World";
        let data = QR8bitByte::new(text);
        let type_number = 2; // "Hello World" 使用版本 2
        
        let mut buffer = BitBuffer::new();
        buffer.put(QRMode::MODE_8BIT_BYTE, 4);
        buffer.put(data.get_length() as i32, get_length_in_bits(QRMode::MODE_8BIT_BYTE, type_number));
        data.write(&mut buffer);
        
        // 添加终止符和填充
        let rs_blocks = get_rs_blocks(type_number, QRErrorCorrectLevel::M);
        let mut total_data_count = 0;
        for block in &rs_blocks {
            total_data_count += block.data_count;
        }
        
        if buffer.length + 4 <= total_data_count as usize * 8 {
            buffer.put(0, 4);
        }
        
        while !buffer.length.is_multiple_of(8) {
            buffer.put_bit(false);
        }
        
        loop {
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0xEC, 8);
            if buffer.length >= total_data_count as usize * 8 {
                break;
            }
            buffer.put(0x11, 8);
        }
        
        println!("\n=== 数据编码调试 ===");
        println!("文本: {}", text);
        println!("类型号: {}", type_number);
        println!("总数据容量: {} 字节", total_data_count);
        println!("数据字节 ({} 个):", buffer.buffer.len());
        for (i, byte) in buffer.buffer.iter().enumerate() {
            println!("  [{:2}] = 0x{:02X} ({:3})", i, byte, byte);
        }
        
        // 计算纠错码
        use qr_polynomial::Polynomial;
        
        let block = &rs_blocks[0];
        let dc_count = block.data_count;
        let ec_count = block.total_count - dc_count;
        
        println!("\nRS 块信息:");
        println!("  数据字节数: {}", dc_count);
        println!("  纠错字节数: {}", ec_count);
        
        let dc = &buffer.buffer[0..dc_count as usize];
        let rs_poly = Polynomial::generate_rs_poly(ec_count);
        let raw_poly = Polynomial::new(dc.to_vec(), 0);
        let mod_poly = raw_poly.r#mod_with_shift(&rs_poly, ec_count);
        
        println!("\n生成多项式 ({} 个系数):", rs_poly.len());
        for i in 0..rs_poly.len() {
            println!("  g[{}] = 0x{:02X}", i, rs_poly.get(i));
        }
        
        println!("\n计算得到的纠错码 ({} 个):", ec_count);
        for i in 0..ec_count {
            println!("  ec[{}] = 0x{:02X}", i, mod_poly.get(i as usize));
        }
    }
}
